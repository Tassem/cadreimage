import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { db, usersTable, generatedImagesTable, userSavedDesignsTable, templatesTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { generateCard } from "./lib/imageGenerator";
import { ensureUploadsDir } from "./lib/imageGenerator";
import fs from "fs/promises";
import path from "path";
import { logger } from "./lib/logger";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const ASPECTS = ["1:1", "16:9", "4:5", "9:16"] as const;
type Aspect = (typeof ASPECTS)[number];

// ── Template aliases ──────────────────────────────────────────────────────────
const TEMPLATE_ALIASES: Record<string, string> = {
  // by ID
  "classic-blue": "classic-blue", "breaking-red": "breaking-red",
  "modern-black": "modern-black", "emerald": "emerald",
  "royal-purple": "royal-purple", "gold": "gold", "midnight": "midnight",
  "slate-fade": "slate-fade", "white-quote": "white-quote",
  "purple-wave": "purple-wave", "crimson": "crimson", "custom": "custom",
  // Arabic names
  "كلاسك": "classic-blue", "كلاسيك": "classic-blue", "ازرق": "classic-blue", "أزرق": "classic-blue",
  "عاجل": "breaking-red", "احمر": "breaking-red", "أحمر": "breaking-red",
  "مودرن": "modern-black", "اسود": "modern-black", "أسود": "modern-black",
  "زمرد": "emerald", "اخضر": "emerald", "أخضر": "emerald",
  "ملكي": "royal-purple", "بنفسجي": "royal-purple",
  "ذهبي": "gold", "بني": "gold",
  "ليلي": "midnight", "كحلي": "midnight",
  "تدرج": "slate-fade", "فيد": "slate-fade",
  "بيضاء": "white-quote", "ابيض": "white-quote", "أبيض": "white-quote",
  "موجة": "purple-wave", "وايف": "purple-wave",
  "قرمزي": "crimson",
  "مخصص": "custom",
  // English short
  "classic": "classic-blue", "blue": "classic-blue",
  "red": "breaking-red", "urgent": "breaking-red",
  "black": "modern-black", "modern": "modern-black",
  "green": "emerald",
  "purple": "royal-purple", "royal": "royal-purple",
  "fade": "slate-fade", "gradient": "slate-fade",
  "white": "white-quote", "quote": "white-quote",
  "wave": "purple-wave",
  // by number
  "1": "classic-blue", "2": "breaking-red", "3": "modern-black",
  "4": "emerald", "5": "royal-purple", "6": "gold",
  "7": "midnight", "8": "slate-fade", "9": "white-quote",
  "10": "purple-wave", "11": "crimson", "12": "custom",
};

const TEMPLATE_LIST = `\
📋 *القوالب المتاحة:*
1️⃣ كلاسك (classic-blue)
2️⃣ عاجل (breaking-red)
3️⃣ مودرن (modern-black)
4️⃣ زمرد (emerald)
5️⃣ ملكي (royal-purple)
6️⃣ ذهبي (gold)
7️⃣ ليلي (midnight)
8️⃣ تدرج (slate-fade)
9️⃣ بيضاء (white-quote)
🔟 موجة (purple-wave)
1️⃣1️⃣ قرمزي (crimson)`;

function resolveTemplate(input: string): string {
  const key = input.trim().toLowerCase();
  return TEMPLATE_ALIASES[key] || TEMPLATE_ALIASES[input.trim()] || "classic-blue";
}

// ── Resolve template: built-in alias → API templates (templatesTable) → user saved designs ──
interface ResolvedTemplate {
  templateId: string;
  displayName: string;
  designSettings?: Record<string, unknown>;
  apiTemplate?: typeof templatesTable.$inferSelect;
}

async function resolveTemplateSettings(nameRaw: string): Promise<ResolvedTemplate> {
  const key = nameRaw.trim().toLowerCase();

  // 1) Built-in alias
  const builtIn = TEMPLATE_ALIASES[key] || TEMPLATE_ALIASES[nameRaw.trim()];
  if (builtIn) return { templateId: builtIn, displayName: builtIn };

  // 2) API templates table — search by slug or name (case-insensitive)
  const trim = nameRaw.trim();
  const apiCandidates = await db
    .select()
    .from(templatesTable)
    .where(or(
      ilike(templatesTable.slug, trim),
      ilike(templatesTable.name, trim)
    ))
    .limit(5);

  const apiTpl = apiCandidates[0];
  if (apiTpl) {
    return { templateId: apiTpl.id.toString(), displayName: apiTpl.name, apiTemplate: apiTpl };
  }

  // 3) user_saved_designs by name (case-insensitive, first match)
  const [found] = await db
    .select()
    .from(userSavedDesignsTable)
    .where(ilike(userSavedDesignsTable.name, trim))
    .limit(1);

  if (found) {
    const s = found.settings as Record<string, unknown>;
    return { templateId: String(s.selectedTemplateId || "classic-blue"), designSettings: s, displayName: found.name };
  }

  return { templateId: "classic-blue", displayName: "classic-blue (افتراضي)" };
}

// ── Session ──────────────────────────────────────────────────────────────────
interface PendingCard {
  title: string;
  templateId: string;
  aspect: Aspect;
  label?: string;
  subtitle?: string;
  customBannerColor?: string;
  customTextColor?: string;
  customPhotoHeight?: number;
  fontSize?: number;
  fontWeight?: number;
  font?: string;
  logoPhotoFilename?: string;
  logoText?: string;
  useLogoText?: boolean;
  logoPos?: string;
  logoInvert?: boolean;
  imgPositionX?: number;
  imgPositionY?: number;
  textShadow?: boolean;
  headlineAlign?: "right" | "center" | "left";
  subtitleAlign?: "right" | "center" | "left";
  labelAlign?: "right" | "center" | "left";
  watermarkText?: string | null;
  watermarkOpacity?: number;
  designName?: string;
  logoUrl?: string | null;
}

interface Session {
  // legacy step-based
  step?: "awaiting_title" | "awaiting_aspect" | "awaiting_color";
  title?: string;
  aspect?: Aspect;
  templateId?: string;
  // new: waiting for photo after format message
  pendingCard?: PendingCard;
}

const sessions = new Map<number, Session>();

// ── DB helpers ───────────────────────────────────────────────────────────────
async function getBotUser(telegramId: number, name: string) {
  const email = `tg_${telegramId}@bot.internal`;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) return existing;
  const { v4: uuidv4 } = await import("uuid");
  const apiKey = `ncg_${uuidv4().replace(/-/g, "")}`;
  const [created] = await db
    .insert(usersTable)
    .values({ name: name || `Telegram User ${telegramId}`, email, passwordHash: "bot-no-password", plan: "free", apiKey })
    .returning();
  return created;
}

// ── Download Telegram photo ──────────────────────────────────────────────────
const UPLOADS_DIR = path.resolve("uploads");

async function downloadPhoto(bot: Telegraf, fileId: string): Promise<string> {
  await ensureUploadsDir();
  const fileInfo = await bot.telegram.getFile(fileId);
  const filePath = fileInfo.file_path!;
  const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download photo");
  const buffer = Buffer.from(await res.arrayBuffer());
  const { v4: uuidv4 } = await import("uuid");
  const ext = path.extname(filePath) || ".jpg";
  const localName = `tg_${uuidv4()}${ext}`;
  const localPath = path.join(UPLOADS_DIR, localName);
  await fs.writeFile(localPath, buffer);
  return localPath;
}

// ── Download URL to local file ────────────────────────────────────────────────
async function downloadUrlToFile(url: string, suffix: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    if (!["http:", "https:"].includes(urlObj.protocol)) return null;
    await ensureUploadsDir();
    const ext = (urlObj.pathname.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 6) || "jpg";
    const { v4: uuidv4 } = await import("uuid");
    const localPath = path.join(UPLOADS_DIR, `url_${uuidv4()}_${suffix}.${ext}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let res: Response;
    try { res = await fetch(url, { signal: controller.signal }); } finally { clearTimeout(timer); }
    if (!res.ok || !res.body) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(localPath, buffer);
    return localPath;
  } catch { return null; }
}

// ── Generate and reply ────────────────────────────────────────────────────────
async function doGenerate(
  ctx: any,
  user: typeof usersTable.$inferSelect,
  card: PendingCard,
  backgroundImagePath?: string
) {
  const FREE_DAILY_LIMIT = 10;
  if (user.plan === "free" && user.imagesToday >= FREE_DAILY_LIMIT) {
    await ctx.reply(`⚠️ وصلت للحد اليومي (${FREE_DAILY_LIMIT} صور). سيتم تجديده غداً.`);
    return;
  }

  const waitMsg = await ctx.reply("⏳ جاري توليد البطاقة...");

  try {
    // Resolve logo: local filename → URL → null
    let logoImagePath: string | null = null;
    if (!card.useLogoText) {
      if (card.logoPhotoFilename) {
        logoImagePath = path.join(UPLOADS_DIR, card.logoPhotoFilename);
      } else if (card.logoUrl) {
        // API template logo URL (possibly relative /api/uploads/…)
        const logoFullUrl = card.logoUrl.startsWith("/")
          ? `http://localhost:8080${card.logoUrl}`
          : card.logoUrl;
        logoImagePath = await downloadUrlToFile(logoFullUrl, "logo");
      }
    }

    // For API templates the templateId may be a numeric string; use "classic-blue" as base
    // All colors are passed explicitly via bannerColor/textColor overrides
    const resolvedId = isNaN(Number(card.templateId)) ? card.templateId : "classic-blue";

    const { filePath, fileName, fileSize } = await generateCard({
      title:              card.title,
      subtitle:           card.subtitle ?? null,
      aspectRatio:        card.aspect,
      templateId:         resolvedId,
      label:              card.label ?? null,
      backgroundImagePath: backgroundImagePath ?? null,
      bannerColor:        card.customBannerColor,
      textColor:          card.customTextColor,
      photoHeight:        card.customPhotoHeight,
      fontSize:           card.fontSize,
      fontWeight:         card.fontWeight,
      font:               card.font,
      logoImagePath,
      logoText:           card.useLogoText ? (card.logoText ?? null) : null,
      logoPos:            card.logoPos ?? null,
      logoInvert:         card.logoInvert ?? false,
      imgPositionX:       card.imgPositionX ?? 50,
      imgPositionY:       card.imgPositionY ?? 50,
      textShadow:         card.textShadow ?? false,
      headlineAlign:      card.headlineAlign,
      subtitleAlign:      card.subtitleAlign,
      labelAlign:         card.labelAlign,
      watermarkText:      card.watermarkText ?? null,
      watermarkOpacity:   card.watermarkOpacity,
    });

    const imageUrl = `/api/uploads/${fileName}`;
    await db.insert(generatedImagesTable).values({ userId: user.id, title: card.title, imageUrl, aspectRatio: card.aspect, fileSize });

    const today = new Date().toISOString().split("T")[0];
    if (user.lastResetDate !== today) {
      await db.update(usersTable).set({ imagesToday: 0, lastResetDate: today }).where(eq(usersTable.id, user.id));
      user.imagesToday = 0;
    }
    await db.update(usersTable).set({ imagesToday: user.imagesToday + 1 }).where(eq(usersTable.id, user.id));

    const fileBuffer = await fs.readFile(filePath);
    await ctx.replyWithPhoto(
      { source: fileBuffer },
      { caption: `✅ تم التوليد بنجاح\n📐 ${card.aspect} | 🎨 ${card.templateId}`, parse_mode: "Markdown" }
    );

    try { await ctx.deleteMessage(waitMsg.message_id); } catch {}
  } catch (err) {
    logger.error({ err }, "Bot image generation failed");
    await ctx.reply("❌ حدث خطأ أثناء توليد الصورة. حاول مرة أخرى.");
    try { await ctx.deleteMessage(waitMsg.message_id); } catch {}
  }
}

// ── Parse format message (returns raw fields; template resolution is async) ───
interface ParsedMessage {
  templateNameRaw: string;
  title: string;
  aspect: Aspect;
  label?: string;
}

function parseFormatMessage(text: string): ParsedMessage | null {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const get = (keys: string[]): string | undefined => {
    for (const line of lines) {
      for (const k of keys) {
        const pattern = new RegExp(`^${k}\\s*[:：]\\s*(.+)`, "i");
        const m = line.match(pattern);
        if (m) return m[1].trim();
      }
    }
    return undefined;
  };

  const templateNameRaw = get(["قالب", "template", "tmp", "tmpl"]) ?? "";
  const title           = get(["عنوان", "title", "خبر", "news"]);
  if (!title) return null;

  const aspectRaw = get(["نسبة", "aspect", "size", "حجم"]);
  const aspect: Aspect = (aspectRaw && ASPECTS.includes(aspectRaw as Aspect)) ? (aspectRaw as Aspect) : "1:1";
  const label = get(["تسمية", "label", "مصدر", "source"]);

  return { templateNameRaw, title, aspect, label };
}

const toAlign = (v: unknown): "right" | "center" | "left" | undefined => {
  if (v === "right" || v === "center" || v === "left") return v;
  return undefined;
};

async function buildPendingCard(parsed: ParsedMessage): Promise<PendingCard> {
  const { templateId, designSettings, displayName, apiTemplate } = await resolveTemplateSettings(parsed.templateNameRaw);
  const s = designSettings;
  const str  = (v: unknown, fallback?: string) => (v != null && String(v)) ? String(v) : fallback;
  const num  = (v: unknown) => v != null && !isNaN(Number(v)) ? Number(v) : undefined;
  const bool = (v: unknown) => v != null ? Boolean(v) : undefined;

  // If resolved to an API template row, extract all fields from it directly
  if (apiTemplate) {
    const t = apiTemplate;
    return {
      title:             parsed.title,
      templateId:        t.id.toString(),
      aspect:            parsed.aspect,
      designName:        t.name,
      // text content (override from message, else template default)
      label:             parsed.label ?? t.label ?? undefined,
      subtitle:          t.subtitle ?? undefined,
      // typography
      font:              t.font,
      fontSize:          t.fontSize,
      fontWeight:        t.fontWeight,
      textShadow:        t.textShadow,
      // colors / layout
      customBannerColor: t.bannerColor,
      customTextColor:   t.textColor,
      customPhotoHeight: t.photoHeight,
      imgPositionX:      50,
      imgPositionY:      50,
      // logo
      logoUrl:           t.logoUrl ?? null,
      logoText:          t.logoText ?? undefined,
      useLogoText:       !!(t.logoText && !t.logoUrl),
      logoPos:           t.logoPos,
      logoInvert:        t.logoInvert,
      // alignment (new)
      headlineAlign:     toAlign(t.headlineAlign),
      subtitleAlign:     toAlign(t.subtitleAlign),
      labelAlign:        toAlign(t.labelAlign),
      // watermark (new)
      watermarkText:     t.watermarkText ?? null,
      watermarkOpacity:  t.watermarkOpacity ? Number(t.watermarkOpacity) : undefined,
    };
  }

  // Legacy: user saved design settings (JSON blob)
  return {
    title:             parsed.title,
    templateId,
    aspect:            parsed.aspect,
    designName:        displayName,
    label:             parsed.label ?? str(s?.label),
    subtitle:          str(s?.subtitle),
    font:              str(s?.font, "Cairo"),
    fontSize:          num(s?.fontSize),
    fontWeight:        num(s?.fontWeight),
    textShadow:        bool(s?.textShadow),
    customBannerColor: str(s?.customBannerColor),
    customTextColor:   str(s?.customTextColor),
    customPhotoHeight: num(s?.customPhotoHeight),
    imgPositionX:      num(s?.imgPositionX),
    imgPositionY:      num(s?.imgPositionY),
    logoPhotoFilename: str(s?.logoPhotoFilename),
    logoText:          str(s?.logoText),
    useLogoText:       bool(s?.useLogoText),
    logoPos:           str(s?.logoPos),
    logoInvert:        bool(s?.logoInvert),
    headlineAlign:     toAlign(s?.headlineAlign),
    subtitleAlign:     toAlign(s?.subtitleAlign),
    labelAlign:        toAlign(s?.labelAlign),
    watermarkText:     s?.watermarkText ? String(s.watermarkText) : null,
    watermarkOpacity:  num(s?.watermarkOpacity),
  };
}

// ── Bot factory ───────────────────────────────────────────────────────────────
export function createBot(token?: string): Telegraf {
  const t = token || BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  const bot = new Telegraf(t);

  // /start
  bot.start(async (ctx) => {
    sessions.delete(ctx.from.id);
    await ctx.reply(
      `🗞️ *مرحباً بك في NewsCard Pro Bot!*\n\n` +
      `*طريقة الاستخدام السريع:*\n` +
      `أرسل رسالة بهذا الشكل:\n\n` +
      `\`قالب : عاجل\n` +
      `عنوان : عنوان الخبر هنا\`\n\n` +
      `ثم أرسل صورة الخلفية (أو اكتب \`/skip\` للمتابعة بدون صورة).\n\n` +
      `يمكنك أيضاً إرسال الصورة مع كتابة النص كتعليق عليها مباشرة.\n\n` +
      `📋 /templates — قائمة القوالب\n` +
      `❓ /help — مساعدة`,
      { parse_mode: "Markdown" }
    );
  });

  // /help
  bot.help(async (ctx) => {
    await ctx.reply(
      `📖 *طريقة الاستخدام:*\n\n` +
      `*١- الطريقة الأساسية (خطوتان):*\n` +
      `أرسل:\n\`قالب : عاجل\nعنوان : عنوان الخبر\`\n` +
      `ثم أرسل صورة الخلفية أو /skip\n\n` +
      `*٢- صورة مباشرة:*\n` +
      `أرسل الصورة وأضف في التعليق:\n` +
      `\`قالب : زمرد\nعنوان : عنوان الخبر\`\n\n` +
      `*٣- بدون صورة خلفية:*\n` +
      `اكتب /skip بعد إرسال التعليمات\n\n` +
      `*الحقول الاختيارية:*\n` +
      `\`نسبة : 16:9\` (أو 1:1 / 4:5 / 9:16)\n` +
      `\`تسمية : CNN\`\n\n` +
      TEMPLATE_LIST,
      { parse_mode: "Markdown" }
    );
  });

  // /templates
  bot.command("templates", async (ctx) => {
    await ctx.reply(TEMPLATE_LIST, { parse_mode: "Markdown" });
  });

  // /skip — generate pending card without photo
  bot.command("skip", async (ctx) => {
    const session = sessions.get(ctx.from.id);
    if (!session?.pendingCard) {
      await ctx.reply("❌ لا يوجد طلب معلق. أرسل تعليمات البطاقة أولاً.");
      return;
    }
    const card = session.pendingCard;
    sessions.delete(ctx.from.id);
    const user = await getBotUser(ctx.from.id, ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ""));
    await doGenerate(ctx, user, card);
  });

  // /generate — legacy step-by-step
  bot.command("generate", async (ctx) => {
    sessions.set(ctx.from.id, { step: "awaiting_title" });
    await ctx.reply("✏️ أرسل *عنوان الخبر:*", { parse_mode: "Markdown" });
  });

  // /quick [title]
  bot.command("quick", async (ctx) => {
    const title = ctx.message.text.replace(/^\/quick\s*/i, "").trim();
    if (!title) {
      await ctx.reply("✏️ مثال: `/quick عنوان الخبر`", { parse_mode: "Markdown" });
      return;
    }
    const user = await getBotUser(ctx.from.id, ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ""));
    await doGenerate(ctx, user, { title, templateId: "classic-blue", aspect: "1:1" });
  });

  // Handle photo messages
  bot.on(message("photo"), async (ctx) => {
    const userId = ctx.from.id;
    const caption = (ctx.message as any).caption || "";
    const photoSizes = ctx.message.photo;
    const biggestPhoto = photoSizes[photoSizes.length - 1];

    // Try parse caption as format message
    const parsed = parseFormatMessage(caption);
    if (parsed) {
      const user = await getBotUser(userId, ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ""));
      const card = await buildPendingCard(parsed);
      let bgPath: string | undefined;
      try { bgPath = await downloadPhoto(bot, biggestPhoto.file_id); } catch {}
      sessions.delete(userId);
      await doGenerate(ctx, user, card, bgPath);
      return;
    }

    // Check if there's a pending card waiting for photo
    const session = sessions.get(userId);
    if (session?.pendingCard) {
      const card = session.pendingCard;
      sessions.delete(userId);
      const user = await getBotUser(userId, ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ""));
      let bgPath: string | undefined;
      try { bgPath = await downloadPhoto(bot, biggestPhoto.file_id); } catch {}
      await doGenerate(ctx, user, card, bgPath);
      return;
    }

    await ctx.reply(
      `📸 استلمت الصورة!\n\n` +
      `لتوليد بطاقة بهذه الصورة كخلفية، أرسل أولاً:\n` +
      `\`قالب : عاجل\nعنوان : عنوان الخبر\`\n\n` +
      `ثم أرسل الصورة مجدداً.`,
      { parse_mode: "Markdown" }
    );
  });

  // Handle text messages
  bot.on(message("text"), async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const session = sessions.get(userId) || {};

    // ── New format: قالب + عنوان in text ───────────────────────────────────
    const parsedRaw = parseFormatMessage(text);
    if (parsedRaw) {
      const card = await buildPendingCard(parsedRaw);
      sessions.set(userId, { pendingCard: card });
      await ctx.reply(
        `✅ *${card.title}*\n🎨 التصميم: ${card.designName ?? card.templateId} | 📐 ${card.aspect}\n\n` +
        `📸 أرسل الآن *صورة الخلفية*، أو اكتب /skip للتوليد بدون صورة.`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    // ── Legacy step flow ────────────────────────────────────────────────────
    if (session.step === "awaiting_title") {
      session.title = text;
      session.step = "awaiting_aspect";
      sessions.set(userId, session);
      await ctx.reply(
        `📰 *${text}*\n\nاختر نسبة الأبعاد أو اكتب: \`1:1\` / \`16:9\` / \`4:5\` / \`9:16\``,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "1:1 مربع", callback_data: "aspect:1:1" }, { text: "16:9 أفقي", callback_data: "aspect:16:9" }],
              [{ text: "4:5 بورتريه", callback_data: "aspect:4:5" }, { text: "9:16 ستوري", callback_data: "aspect:9:16" }],
            ],
          },
        }
      );
      return;
    }

    if (session.step === "awaiting_aspect") {
      const asp = ASPECTS.includes(text as Aspect) ? (text as Aspect) : "1:1";
      session.aspect = asp;
      session.step = "awaiting_color";
      sessions.set(userId, session);
      await ctx.reply(
        `📐 *${asp}*\n\nاختر القالب:`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔵 كلاسك", callback_data: "color:classic-blue" }, { text: "🔴 عاجل", callback_data: "color:breaking-red" }],
              [{ text: "⚫ مودرن", callback_data: "color:modern-black" }, { text: "🟢 زمرد", callback_data: "color:emerald" }],
              [{ text: "🟣 ملكي", callback_data: "color:royal-purple" }, { text: "🟡 ذهبي", callback_data: "color:gold" }],
              [{ text: "🌙 ليلي", callback_data: "color:midnight" }, { text: "💜 موجة", callback_data: "color:purple-wave" }],
            ],
          },
        }
      );
      return;
    }

    // Default: quick generate
    const user = await getBotUser(userId, ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ""));
    await doGenerate(ctx, user, { title: text, templateId: "classic-blue", aspect: "1:1" });
  });

  // Callback queries (legacy step flow)
  bot.on("callback_query", async (ctx) => {
    await ctx.answerCbQuery();
    const data = (ctx.callbackQuery as { data?: string }).data;
    if (!data) return;
    const userId = ctx.from!.id;
    const session = sessions.get(userId) || {};

    if (data.startsWith("aspect:")) {
      const aspect = data.replace("aspect:", "") as Aspect;
      session.aspect = aspect;
      session.step = "awaiting_color";
      sessions.set(userId, session);
      await ctx.editMessageText(`📐 *${aspect}*\n\nاختر القالب:`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔵 كلاسك", callback_data: "color:classic-blue" }, { text: "🔴 عاجل", callback_data: "color:breaking-red" }],
            [{ text: "⚫ مودرن", callback_data: "color:modern-black" }, { text: "🟢 زمرد", callback_data: "color:emerald" }],
            [{ text: "🟣 ملكي", callback_data: "color:royal-purple" }, { text: "🟡 ذهبي", callback_data: "color:gold" }],
            [{ text: "🌙 ليلي", callback_data: "color:midnight" }, { text: "💜 موجة", callback_data: "color:purple-wave" }],
          ],
        },
      });
    } else if (data.startsWith("color:")) {
      const templateId = data.replace("color:", "");
      session.templateId = templateId;
      const card: PendingCard = { title: session.title!, templateId, aspect: session.aspect || "1:1" };
      sessions.set(userId, { pendingCard: card });
      try { await ctx.deleteMessage(); } catch {}
      await ctx.reply(
        `✅ *${card.title}*\n🎨 ${templateId} | 📐 ${card.aspect}\n\n📸 أرسل *صورة الخلفية* أو /skip للتوليد مباشرة.`,
        { parse_mode: "Markdown" }
      );
    }
  });

  bot.catch((err, ctx) => {
    logger.error({ err, update: ctx.update }, "Bot error");
  });

  return bot;
}

let runningBot: Telegraf | null = null;

export async function startBot(): Promise<void> {
  await ensureUploadsDir();
  runningBot = createBot();
  logger.info("Starting Telegram bot...");
  runningBot.launch();
  logger.info("Telegram bot launched (long polling)");
  process.once("SIGINT", () => runningBot?.stop("SIGINT"));
  process.once("SIGTERM", () => runningBot?.stop("SIGTERM"));
}

export async function startBotWithToken(token: string): Promise<void> {
  await ensureUploadsDir();
  // Stop current running bot if any
  if (runningBot) {
    try { runningBot.stop("restart"); } catch {}
    runningBot = null;
  }
  runningBot = createBot(token);
  logger.info("Starting Telegram bot with new token...");
  runningBot.launch();
  logger.info("Telegram bot launched");
}
