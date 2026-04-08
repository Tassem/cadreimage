# مولّد البطاقات الإخبارية — News Card Generator Pro

> منصة SaaS لتوليد بطاقات إخبارية احترافية بجودة بث تلفزيوني — تدعم العربية والإنجليزية والفرنسية

[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange)](https://pnpm.io)

---

## 🧠 فكرة المشروع

الغرف الإخبارية العربية تحتاج يومياً لإنتاج بطاقات إخبارية بصرية لنشرها على منصات التواصل. كل بطاقة كانت تستغرق 15–30 دقيقة بأدوات مثل Canva أو Photoshop.

**الحل:** منصة تُنتج بطاقة إخبارية جاهزة بدقة 1080×1080 خلال أقل من 3 ثوانٍ، تعمل عبر:
- واجهة ويب مجانية عامة (`/`)
- لوحة تحكم Pro للمؤسسات (`/pro/`)
- Telegram Bot
- REST API للمطورين

---

## 🏗️ المعمارية الكاملة

```
المستخدم
   │
   ├── /               ← مولّد البطاقات المجاني  (news-card-generator)
   ├── /pro/           ← لوحة التحكم Pro         (news-card-pro)
   ├── /api/           ← Express 5 REST API       (api-server)
   └── Telegram Bot    ← مدمج داخل api-server
                              │
                    ┌─────────▼──────────┐
                    │    api-server       │
                    │  Express 5 + JWT    │
                    │  Playwright Chrome  │
                    │  Drizzle ORM        │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   PostgreSQL DB     │
                    │   users            │
                    │   templates        │
                    │   generated_images │
                    │   plans            │
                    │   system_settings  │
                    │   user_saved_designs│
                    └────────────────────┘
```

### تدفق توليد البطاقة — خطوة بخطوة

```
1. المستخدم يكتب العنوان ويختار القالب في واجهة React
2. POST /api/generate  ← Authorization: Bearer <JWT> أو X-API-Key
3. requireAuth middleware → يتحقق من الـ JWT → يجلب المستخدم من DB
4. checkDailyLimit → يتحقق من عدد البطاقات اليوم حسب الخطة
5. GenerateImageBody.safeParse(req.body) ← Zod validation
6. تحديد القالب: built-in string أو رقمي من DB (templatesTable)
7. generateCard() في imageGenerator.ts:
   أ) يبني HTML كاملاً مع CSS + خط Cairo مضمّن بـ base64
   ب) يفتح Playwright page بأبعاد القالب (مثلاً 1080×1080)
   ج) يحمّل الـ HTML كـ setContent()
   د) page.screenshot() على عنصر #card → PNG buffer
8. يحفظ الصورة في uploads/ بـ UUID فريد
9. يُسجّل السجل في generated_images table
10. يُرجع { imageUrl: "/api/uploads/card-<uuid>.png", ... }
```

---

## 📁 هيكل الملفات الكامل

```
workspace/
├── artifacts/
│   ├── api-server/                  ← الخادم الخلفي الرئيسي
│   │   ├── src/
│   │   │   ├── app.ts               ← Express setup: CORS, JSON, static, routes
│   │   │   ├── index.ts             ← نقطة الدخول: PORT، shutdown، bot startup
│   │   │   ├── bot.ts               ← Telegram bot بـ Telegraf.js
│   │   │   ├── lib/
│   │   │   │   ├── imageGenerator.ts   ← CORE: HTML builder + Playwright → PNG
│   │   │   │   └── logger.ts           ← Pino structured logging
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts          ← JWT verify + API key + user attach
│   │   │   │   └── planGuard.ts     ← daily/template/design limit checker
│   │   │   └── routes/
│   │   │       ├── index.ts         ← يجمع كل الـ routers
│   │   │       ├── auth.ts          ← /register /login /me
│   │   │       ├── generate.ts      ← /generate (الأهم — توليد البطاقات)
│   │   │       ├── templates.ts     ← CRUD للقوالب
│   │   │       ├── history.ts       ← سجل البطاقات
│   │   │       ├── admin.ts         ← /admin/* (إدارة المستخدمين)
│   │   │       ├── designs.ts       ← التصاميم المحفوظة
│   │   │       ├── settings.ts      ← إعدادات النظام (DB key-value)
│   │   │       ├── plans.ts         ← الخطط والأسعار
│   │   │       ├── bot.ts           ← API للتحكم في بوت Telegram
│   │   │       ├── photo.ts         ← رفع الصور
│   │   │       └── health.ts        ← /health endpoint
│   │   ├── uploads/                 ← البطاقات المولّدة (PNG files بـ UUID)
│   │   └── src/fonts/
│   │       ├── cairo.ttf            ← خط Cairo (مضمّن بـ base64 في الـ HTML)
│   │       └── cairo.woff2
│   │
│   ├── news-card-generator/         ← الأداة المجانية العامة
│   │   └── src/
│   │       ├── App.tsx              ← يبدّل بين Landing ↔ Home
│   │       ├── pages/
│   │       │   ├── Landing.tsx      ← صفحة التسويق (dark theme + red accent)
│   │       │   └── Home.tsx         ← أداة التوليد المجانية
│   │       ├── lib/i18n.ts          ← إعداد i18next (AR/EN/FR)
│   │       └── locales/
│   │           ├── ar/translation.json
│   │           ├── en/translation.json
│   │           └── fr/translation.json
│   │
│   ├── news-card-pro/               ← لوحة التحكم للمشتركين
│   │   └── src/
│   │       ├── App.tsx              ← Wouter router + AuthGuard + QueryClient
│   │       └── pages/
│   │           ├── Login.tsx
│   │           ├── Register.tsx
│   │           ├── Dashboard.tsx    ← إحصائيات الاستخدام + رسم بياني
│   │           ├── Generate.tsx     ← منشئ البطاقات الكامل مع كل الإعدادات
│   │           ├── Templates.tsx    ← إدارة القوالب المخصصة (CRUD)
│   │           ├── History.tsx      ← معرض البطاقات السابقة بـ grid
│   │           ├── Keys.tsx         ← إدارة مفاتيح API
│   │           ├── TelegramBot.tsx  ← ربط وإعداد البوت
│   │           ├── Subscription.tsx ← الخطط والأسعار
│   │           └── Admin.tsx        ← إدارة المستخدمين والإحصائيات
│   │
│   └── mockup-sandbox/              ← بيئة معزولة لاختبار المكونات
│
├── lib/
│   ├── db/src/schema/               ← Drizzle ORM schema (TypeScript)
│   ├── api-spec/openapi.yaml        ← مواصفة OpenAPI 3.1
│   ├── api-zod/                     ← Zod schemas مُولَّدة تلقائياً من OpenAPI
│   └── api-client-react/            ← React Query hooks مُولَّدة تلقائياً
│
├── nginx/
│   ├── generator.conf               ← Reverse proxy للأداة المجانية
│   └── pro.conf                     ← Reverse proxy للوحة Pro
├── Dockerfile
├── docker-compose.yml
└── pnpm-workspace.yaml              ← يُعرِّف كل الـ packages
```

---

## ⚙️ المنطق الأساسي

### imageGenerator.ts — قلب النظام

```typescript
// Chromium instance واحد مشترك بين كل الطلبات
const MAX_PAGES = 1;
let sharedBrowser: Browser | null = null;
let activePages = 0;
const pageWaiters: Array<() => void> = [];

// يفتح Chromium مرة واحدة ويعيد استخدامه
async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser?.isConnected()) return sharedBrowser;
  sharedBrowser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  sharedBrowser.on("disconnected", () => { sharedBrowser = null; });
  return sharedBrowser;
}

// Semaphore: يضمن معالجة MAX_PAGES طلبات في وقت واحد فقط
async function withPage<T>(fn: (browser: Browser) => Promise<T>): Promise<T> {
  await acquirePageSlot();
  try {
    return await fn(await getSharedBrowser());
  } finally {
    releasePageSlot();
  }
}

// الدالة الرئيسية للتوليد
export async function generateCard(options): Promise<{ filePath, fileName, fileSize }> {
  // 1. تحويل الصور المحلية إلى base64 قبل دخول الـ queue
  const bgDataUrl = options.backgroundImagePath
    ? await fileToDataUrl(options.backgroundImagePath) : undefined;

  // 2. بناء HTML كاملاً مع CSS + خط Cairo مضمّن بـ base64
  const html = await buildHtml(options, w, h, bgDataUrl, logoDataUrl, overlayDataUrl);

  // 3. التوليد عبر Playwright داخل الـ queue
  const buffer = await withPage(async (browser) => {
    const page = await browser.newPage();
    try {
      await page.setViewportSize({ width: w, height: h });
      await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(500); // انتظار تحميل الخطوط
      const card = await page.$("#card");
      return await card.screenshot({ type: "png" });
    } finally {
      await page.close().catch(() => {});
    }
  });

  // 4. حفظ الملف
  const fileName = `card-${uuidv4()}.png`;
  await fs.writeFile(path.join(UPLOADS_DIR, fileName), buffer);
  return { filePath: path.join(UPLOADS_DIR, fileName), fileName, fileSize: buffer.length };
}
```

### planGuard.ts — حماية حدود الاستخدام

```typescript
const DEFAULT_PLANS = {
  free:    { cardsPerDay: 5,   apiAccess: false, telegramBot: false },
  starter: { cardsPerDay: 30,  apiAccess: true,  telegramBot: true  },
  pro:     { cardsPerDay: 150, apiAccess: true,  telegramBot: true  },
  agency:  { cardsPerDay: -1,  apiAccess: true,  telegramBot: true  }, // -1 = لامحدود
};

// Cache بـ 30 ثانية لتجنب DB queries المتكررة
let planCache: Plan[] = [];
let planCacheAt = 0;

export async function checkDailyLimit(userId, planSlug) {
  const limits = await getPlanLimits(planSlug);
  if (limits.cardsPerDay === -1) return { allowed: true, used: 0, limit: -1 };

  const [user] = await db.select({ imagesToday, lastResetDate })
    .from(usersTable).where(eq(usersTable.id, userId));

  const today = new Date().toISOString().slice(0, 10);
  const used = user.lastResetDate === today ? user.imagesToday : 0;
  return { allowed: used < limits.cardsPerDay, used, limit: limits.cardsPerDay };
}
```

### auth.ts — المصادقة المزدوجة

```typescript
// يدعم طريقتين للمصادقة:

// 1) JWT Bearer Token (للمستخدمين عبر الواجهة)
if (header?.startsWith("Bearer ")) {
  const payload = jwt.verify(token, JWT_SECRET);
  userId = payload.userId; // JWT صالح لمدة 30 يوم
}

// 2) X-API-Key Header (للمطورين عبر API)
else if (req.headers["x-api-key"]) {
  const user = await db.select().from(usersTable)
    .where(eq(usersTable.apiKey, apiKey));
  userId = user.id;
}
```

---

## 🗄️ قاعدة البيانات — PostgreSQL + Drizzle ORM

```sql
-- المستخدمون
users (
  id              SERIAL PRIMARY KEY,
  name            TEXT,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT,                   -- bcrypt
  plan            TEXT DEFAULT 'free',    -- free | starter | pro | agency
  api_key         TEXT UNIQUE,            -- للوصول عبر API
  images_today    INT DEFAULT 0,          -- عداد اليوم
  last_reset_date TEXT,                   -- تاريخ آخر reset للعداد
  is_admin        BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW()
)

-- القوالب
templates (
  id            SERIAL PRIMARY KEY,
  name          TEXT,
  banner_color  TEXT,                    -- لون الخلفية الرئيسي
  text_color    TEXT,
  label_color   TEXT,
  font          TEXT DEFAULT 'cairo',
  font_size     INT,
  aspect_ratio  TEXT DEFAULT '1:1',      -- 1:1 | 9:16 | 16:9
  logo_url      TEXT,
  logo_text     TEXT,
  logo_pos      TEXT,                    -- top-left | top-right | bottom-...
  canvas_layout TEXT,                    -- JSON: { headline: {x,y,w}, ... }
  watermark_text TEXT,
  is_built_in   BOOLEAN DEFAULT false,
  user_id       INT REFERENCES users(id)
)

-- البطاقات المولّدة
generated_images (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id),
  template_id  INT REFERENCES templates(id),
  title        TEXT,
  image_url    TEXT,                     -- /api/uploads/card-<uuid>.png
  aspect_ratio TEXT,
  file_size    INT,
  created_at   TIMESTAMP DEFAULT NOW()
)

-- خطط الاشتراك
plans (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE,           -- free | starter | pro | agency
  cards_per_day   INT,                   -- -1 = لامحدود
  max_templates   INT,
  max_saved_designs INT,
  api_access      BOOLEAN,
  telegram_bot    BOOLEAN,
  overlay_upload  BOOLEAN,
  custom_watermark BOOLEAN,
  price_monthly   NUMERIC,
  price_yearly    NUMERIC,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT
)

-- إعدادات النظام (key-value store)
system_settings (
  key   TEXT PRIMARY KEY,               -- مثال: "telegram_bot_token"
  value TEXT
)

-- التصاميم المحفوظة للمستخدم
user_saved_designs (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id),
  name       TEXT,
  settings   JSONB,                     -- كل إعدادات البطاقة
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🔌 REST API الكاملة

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | إنشاء حساب جديد | — |
| POST | `/api/auth/login` | تسجيل الدخول → JWT | — |
| GET | `/api/auth/me` | بيانات المستخدم الحالي | JWT |
| **POST** | **`/api/generate`** | **توليد بطاقة PNG** | JWT / API-Key |
| GET | `/api/templates` | قائمة القوالب | JWT |
| POST | `/api/templates` | إنشاء قالب جديد | JWT |
| PUT | `/api/templates/:id` | تعديل قالب | JWT |
| DELETE | `/api/templates/:id` | حذف قالب | JWT |
| GET | `/api/history` | سجل البطاقات المولّدة | JWT |
| GET | `/api/stats` | إحصائيات الاستخدام | JWT |
| POST | `/api/keys/regenerate` | توليد API key جديد | JWT |
| GET | `/api/plans` | الخطط المتاحة | — |
| POST | `/api/admin/login` | دخول المدير | — |
| GET | `/api/admin/stats` | إحصائيات النظام | Admin |
| GET | `/api/health` | فحص صحة الخادم | — |

### مثال عملي

```bash
# توليد بطاقة إخبارية
curl -X POST https://your-domain.com/api/generate \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "القمة العربية تنتهي بإعلان تاريخي",
    "subtitle": "اتفاقية شاملة تحدد مسار المنطقة للعقد القادم",
    "label": "عاجل",
    "templateId": "breaking-red",
    "aspectRatio": "1:1"
  }'

# الرد
{
  "id": 42,
  "imageUrl": "/api/uploads/card-550e8400-e29b-41d4-a716.png",
  "imageFullUrl": "https://your-domain.com/api/uploads/card-550e8400.png",
  "aspectRatio": "1:1",
  "createdAt": "2026-04-08T03:54:00.000Z"
}
```

---

## 🤖 Telegram Bot

المستخدم يرسل للبوت:

```
/start                          ← ترحيب + شرح الأوامر
/generate عاجل عنوان الخبر      ← يولّد بطاقة فوراً بالقالب المحدد
/templates                      ← قائمة القوالب المتاحة
/history                        ← آخر 5 بطاقات مولّدة
```

القوالب تُعرَّف بـ aliases متعددة (عربي / إنجليزي / رقمي):

| الرقم | عربي | إنجليزي | Template ID |
|-------|------|---------|------------|
| 1 | كلاسك / أزرق | classic / blue | `classic-blue` |
| 2 | عاجل / أحمر | red / urgent | `breaking-red` |
| 3 | مودرن / أسود | modern / black | `modern-black` |
| 4 | زمرد / أخضر | green | `emerald` |
| 5 | ملكي / بنفسجي | purple / royal | `royal-purple` |
| 6 | ذهبي | gold | `gold` |
| 7 | ليلي / كحلي | midnight | `midnight` |
| 8 | تدرج | gradient / fade | `slate-fade` |
| 9 | بيضاء | white / quote | `white-quote` |
| 10 | موجة | wave | `purple-wave` |
| 11 | قرمزي | crimson | `crimson` |

---

## 🎨 الواجهة الأمامية

### الأداة المجانية (`/`)

```
App.tsx
  ├── Landing.tsx  ← صفحة تسويقية (dark theme + red accent)
  │     ├── Navbar: شعار "ن مولّد البطاقات" + روابط + EN/AR/FR
  │     ├── Hero: خلفية داكنة + وهج أحمر + عنوان ضخم + 2 CTA
  │     ├── Features: خلفية فاتحة + 3 بطاقات مميزات
  │     ├── HowItWorks: 3 خطوات مرقّمة + خطوط وصل
  │     ├── Pricing: خلفية داكنة + 3 خطط (مجاني / أساسي★ / برو)
  │     └── Footer: 3 أعمدة (المنتج / Legal / شعار)
  └── Home.tsx  ← منشئ البطاقات المجاني (يظهر بعد "ابدأ الآن")
        ├── sidebar: اختيار القالب
        ├── canvas: معاينة مباشرة للبطاقة
        ├── form: العنوان، الصورة، الشعار
        └── زر تحميل PNG
```

### لوحة التحكم Pro (`/pro/`)

```
App.tsx (Wouter Router بـ base="/pro/")
  ├── /login, /register         ← صفحات عامة
  └── [محمية بـ AuthGuard + JWT]
      ├── /dashboard            ← بطاقات إحصائية + رسم بياني Recharts
      ├── /generate             ← منشئ البطاقات الكامل
      ├── /templates            ← إدارة القوالب (CRUD)
      ├── /history              ← معرض البطاقات بـ grid + تحميل
      ├── /keys                 ← إدارة مفاتيح API
      ├── /telegram             ← ربط البوت (إدخال التوكن)
      ├── /subscription         ← الخطط والترقية
      └── /admin                ← إدارة المستخدمين والإحصائيات
```

**المكتبات المستخدمة:**

| المكتبة | الاستخدام |
|---------|----------|
| Radix UI + Tailwind CSS v4 | مكونات UI |
| Framer Motion | الأنيميشن |
| TanStack Query | جلب البيانات والـ cache |
| React Hook Form + Zod | النماذج والتحقق |
| Recharts | الرسوم البيانية |
| Wouter | الـ routing |
| i18next | الترجمة (AR/EN/FR) |

---

## 🚀 كيف تشغّل المشروع

### متطلبات النظام

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Chromium أو Google Chrome

### تشغيل محلي

```bash
# 1. نسخ المشروع
git clone https://github.com/Tassem/newproject
cd newproject

# 2. تثبيت جميع الـ dependencies
pnpm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
```

```env
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/newscards
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret
TELEGRAM_BOT_TOKEN=optional-bot-token-from-botfather
```

```bash
# 4. إنشاء جداول قاعدة البيانات
pnpm --filter @workspace/db run db:push

# 5. تشغيل الخدمات (3 terminals منفصلة)
pnpm --filter @workspace/api-server run dev          # http://localhost:8080
pnpm --filter @workspace/news-card-generator run dev # http://localhost:3000
pnpm --filter @workspace/news-card-pro run dev       # http://localhost:3001
```

### تشغيل بـ Docker Compose

```bash
docker-compose up -d

# الخدمات:
# http://localhost:3000  → الأداة المجانية
# http://localhost:3001  → لوحة Pro
# http://localhost:8080  → API
# localhost:5432         → PostgreSQL
```

### حسابات الاختبار الجاهزة

| Email | Password | الدور |
|-------|----------|-------|
| `admin@newscard.pro` | `Admin@123` | مدير + Pro |
| `demo@newscard.pro` | `Demo@123` | مستخدم مجاني |

---

## 📊 الخطط والأسعار

| الخطة | بطاقات/يوم | قوالب مخصصة | API | بوت Telegram | رفع Overlay |
|-------|-----------|------------|-----|-------------|------------|
| مجاني | 5 | 2 | ✗ | ✗ | ✗ |
| Starter | 30 | 10 | ✓ | ✓ | ✗ |
| Pro | 150 | 50 | ✓ | ✓ | ✓ |
| Agency | ∞ | ∞ | ✓ | ✓ | ✓ |

---

## 🔍 مراجعة الكود — مشاكل مكتشفة

> تحليل دقيق للكود الفعلي — مشاكل حقيقية وليست توقعات نظرية.

### 🔴 CRITICAL — يكسر Production

#### 1. Race Condition في Daily Limit

```typescript
// generate.ts — المشكلة
const { allowed } = await checkDailyLimit(user.id, user.plan); // يقرأ 4
// ... 3 ثوانٍ لتوليد الصورة ...
await db.update(usersTable)
  .set({ imagesToday: user.imagesToday + 1 }) // يكتب 5 (من قيمة قديمة!)
```

مستخدم مجاني يرسل 3 طلبات في نفس اللحظة: كلها تقرأ `imagesToday = 4`، كلها ترى `4 < 5 = مسموح`، كلها تولّد. النتيجة: يتجاوز الحد بـ 3×.

**الحل:** Atomic SQL increment مع الشرط في نفس الـ query.

#### 2. Race Condition في Browser Launch

```typescript
async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser?.isConnected()) return sharedBrowser;
  // لا يوجد mutex — 5 طلبات متزامنة = 5 عمليات Chromium!
  sharedBrowser = await chromium.launch(...); // يستغرق 2-3 ثوانٍ
}
```

**الحل:** Launch promise يمنع التزامن عند بدء التشغيل أو بعد crash.

#### 3. Queue بدون Timeout

```typescript
return new Promise(resolve =>
  pageWaiters.push(() => { activePages++; resolve(); })
);
// طلب معلّق للأبد إذا علق Chromium
```

**الحل:** `setTimeout` يرفض الطلب بعد 30 ثانية مع رسالة خطأ واضحة.

---

### 🟠 HIGH — ثغرات أمنية وتسريب موارد

#### 4. Temp Files لا تُحذف أبداً

الملفات المؤقتة المحمّلة من URLs الخارجية (`url_${Date.now()}_bg.jpg`) تُحفظ في `uploads/` ولا تُحذف بعد التوليد. بعد 3 أشهر في production → عشرات الغيغابايت.

#### 5. `uploads/` مكشوف بدون Authentication

```typescript
app.use("/api/uploads", express.static(path.resolve("uploads")));
// أي شخص يعرف UUID يصل للصورة مباشرة
```

#### 6. لا Rate Limiting على Auth

`/register` و `/login` بدون حد للطلبات → brute force وتسجيل حسابات وهمية لا محدود.

#### 7. Telegram Bot Token محفوظ Plaintext في DB

```typescript
await setSetting("telegram_bot_token", trimmed); // plaintext!
```

---

### 🟡 MEDIUM — أداء وممارسات سيئة

#### 8. Dynamic `import()` في كل طلب HTTP

```typescript
router.post("/generate", async (req, res) => {
  const { BUILT_IN_TEMPLATES } = await import("../lib/imageGenerator"); // كل request!
```

يجب static import في أعلى الملف.

#### 9. `waitForTimeout(500)` — نوم ثابت في كل بطاقة

```typescript
await page.waitForTimeout(500); // 500ms × 1000 بطاقة/يوم = 8 دقائق ضائعة
```

**الحل:** `page.waitForFunction(() => document.fonts.ready)`.

#### 10. `imagesToday` Counter غير Atomic

```typescript
// user.imagesToday قُرئ لحظة الـ authentication، ليس الآن
await db.update(usersTable)
  .set({ imagesToday: user.imagesToday + 1 }) // قيمة stale!
```

#### 11. Plan Cache في الذاكرة فقط

مع PM2 cluster أو Kubernetes، كل process لها cache مختلف. تحديث خطة من Admin panel لا ينعكس على الـ processes الأخرى.

#### 12. `Date.now()` لأسماء الملفات المؤقتة

```typescript
const localName = `url_${Date.now()}_${suffix}.${ext}`;
// طلبان في نفس الـ millisecond → نفس الاسم → تلف بيانات
```

**الحل:** استخدام `uuidv4()`.

---

## 🔥 خطة إعادة البناء المثلى

لو أُعيد البناء من الصفر اليوم:

| المكون | الحالي | الأفضل | السبب |
|--------|--------|--------|-------|
| توليد الصور | Playwright + Chromium | Satori.js → SVG → PNG | أسرع 10×، أخف 80× في RAM |
| تخزين الملفات | `uploads/` محلي | Cloudflare R2 + Signed URLs | CDN تلقائي + أمان |
| Queue | In-process semaphore | BullMQ + Redis | توزيع على workers + monitoring |
| Cache الخطط | In-memory | Redis | مشترك بين كل الـ processes |
| المصادقة | JWT يدوي | Better-Auth أو Lucia | أكثر أماناً وميزات |
| Rate Limiting | لا يوجد | express-rate-limit + Redis | ضروري في production |
| Monorepo | pnpm workspaces | pnpm + Turborepo | caching وبناء أسرع |
| الاختبارات | لا يوجد | Playwright E2E + Vitest | ضمان جودة |

---

## 🛠️ التقنيات المستخدمة

**Backend:**
- Express 5
- TypeScript
- Drizzle ORM
- PostgreSQL
- Playwright / Chromium
- JWT (jsonwebtoken)
- bcryptjs
- Telegraf.js (Telegram Bot)
- Pino (logging)
- Zod (validation)

**Frontend:**
- React 18
- Vite
- Tailwind CSS v4
- Radix UI
- Framer Motion
- TanStack Query
- Wouter
- i18next

**Infrastructure:**
- pnpm Workspaces (Monorepo)
- Docker + Docker Compose
- Nginx (Reverse Proxy)
- OpenAPI 3.1

---

## 📄 الترخيص

© 2026 News Card Generator Pro. جميع الحقوق محفوظة.

---

*مبني بـ Express 5 · React · Vite · PostgreSQL · Drizzle ORM · Playwright · Telegraf.js · pnpm Workspaces*
