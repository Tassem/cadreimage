import path from "path";
import fs from "fs";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { Router, type IRouter } from "express";
import { db, usersTable, generatedImagesTable, templatesTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { GenerateImageBody } from "@workspace/api-zod";
import { generateCard } from "../lib/imageGenerator";
import { checkDailyLimit, getPlanLimits } from "../middlewares/planGuard";

/** Download a remote URL to a local temp file. Returns local file path or null on failure. */
async function downloadUrlToFile(url: string, suffix: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const allowed = ["http:", "https:"];
    if (!allowed.includes(urlObj.protocol)) return null;

    const uploadsDir = path.resolve("uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = (urlObj.pathname.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 6) || "jpg";
    const localName = `url_${Date.now()}_${suffix}.${ext}`;
    const localPath = path.join(uploadsDir, localName);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok || !res.body) return null;

    const writer = createWriteStream(localPath);
    await pipeline(Readable.fromWeb(res.body as any), writer);
    return localPath;
  } catch {
    return null;
  }
}

const router: IRouter = Router();

router.post("/generate", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const user = req.user!;

  // Reset daily count if it's a new day
  const today = new Date().toISOString().slice(0, 10);
  if (user.lastResetDate !== today) {
    await db.update(usersTable).set({ imagesToday: 0, lastResetDate: today }).where(eq(usersTable.id, user.id));
    user.imagesToday = 0;
  }

  // Check daily limit from plan
  const { allowed, used, limit } = await checkDailyLimit(user.id, user.plan);
  if (!allowed) {
    res.status(429).json({ error: `وصلت إلى الحد اليومي (${limit} بطاقة). يرجى ترقية باقتك للحصول على مزيد.`, limit, used });
    return;
  }

  const parsed = GenerateImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const body = parsed.data;

  // Resolve templateId: can be a built-in string like "classic-blue" or a numeric DB template id
  const rawTemplateId = body.templateId;

  let resolvedTemplateId = "classic-blue";
  let dbTemplateNumericId: number | null = null;

  // Full template defaults loaded from DB (all fields)
  type TemplateOverrides = {
    bannerColor?: string;
    textColor?: string;
    labelColor?: string;
    font?: string;
    fontSize?: number;
    fontWeight?: number;
    photoHeight?: number;
    subtitle?: string | null;
    label?: string | null;
    logoUrl?: string | null;
    logoText?: string | null;
    logoPos?: string;
    logoInvert?: boolean;
    textShadow?: boolean;
    headlineAlign?: "right" | "center" | "left";
    subtitleAlign?: "right" | "center" | "left";
    labelAlign?: "right" | "center" | "left";
    watermarkText?: string | null;
    watermarkOpacity?: number;
  };
  let templateOverrides: TemplateOverrides = {};

  // Import BUILT_IN_TEMPLATES for validation
  const { BUILT_IN_TEMPLATES } = await import("../lib/imageGenerator");

  const toAlign = (v: unknown): "right" | "center" | "left" | undefined => {
    if (v === "right" || v === "center" || v === "left") return v as "right" | "center" | "left";
    return undefined;
  };

  /** Extract all override fields from a DB template row */
  function extractOverrides(t: typeof templatesTable.$inferSelect): TemplateOverrides {
    return {
      bannerColor:    t.bannerColor    ?? undefined,
      textColor:      t.textColor      ?? undefined,
      labelColor:     t.labelColor     ?? undefined,
      font:           t.font           ?? undefined,
      fontSize:       t.fontSize       ?? undefined,
      fontWeight:     t.fontWeight     ?? undefined,
      photoHeight:    t.photoHeight    ?? undefined,
      subtitle:       t.subtitle       ?? null,
      label:          t.label          ?? null,
      logoUrl:        t.logoUrl        ?? null,
      logoText:       t.logoText       ?? null,
      logoPos:        t.logoPos        ?? "top-right",
      logoInvert:     t.logoInvert     ?? false,
      textShadow:     t.textShadow     ?? false,
      headlineAlign:  toAlign(t.headlineAlign),
      subtitleAlign:  toAlign(t.subtitleAlign),
      labelAlign:     toAlign(t.labelAlign),
      watermarkText:  t.watermarkText  ?? null,
      watermarkOpacity: t.watermarkOpacity ? Number(t.watermarkOpacity) : undefined,
    };
  }

  if (rawTemplateId !== null && rawTemplateId !== undefined) {
    if (typeof rawTemplateId === "number") {
      // Numeric DB template ID
      const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, rawTemplateId));
      if (template && (template.userId === user.id || template.isPublic)) {
        dbTemplateNumericId = rawTemplateId;
        templateOverrides = extractOverrides(template);
      } else {
        res.status(400).json({
          error: `Template ID ${rawTemplateId} not found`,
          availableBuiltInTemplates: Object.keys(BUILT_IN_TEMPLATES),
        });
        return;
      }
    } else if (typeof rawTemplateId === "string") {
      if (BUILT_IN_TEMPLATES[rawTemplateId]) {
        // Known built-in template ID like "classic-blue" or "teal"
        resolvedTemplateId = rawTemplateId;
      } else {
        // Try to find by slug first, then by name (user's own OR public)
        const candidates = await db
          .select()
          .from(templatesTable)
          .where(or(
            eq(templatesTable.userId, user.id),
            eq(templatesTable.isPublic, true)
          ));

        const key = rawTemplateId.trim().toLowerCase();
        const dbTpl = candidates.find(r =>
          (r.slug ?? "").trim().toLowerCase() === key ||
          r.name.trim().toLowerCase() === key
        );

        if (dbTpl) {
          dbTemplateNumericId = dbTpl.id;
          templateOverrides = extractOverrides(dbTpl);
        } else {
          res.status(400).json({
            error: `Template "${rawTemplateId}" not found. Use a built-in ID, a numeric template ID, or a template slug.`,
            availableBuiltInTemplates: Object.keys(BUILT_IN_TEMPLATES),
            tip: "Create a custom template in the dashboard and note its ID or slug.",
          });
          return;
        }
      }
    }
  }

  // Read extra fields directly from req.body (not Zod-parsed) to allow passthrough
  const rawBody = req.body as Record<string, unknown>;

  const safeFilename = (v: unknown) =>
    v ? String(v).replace(/[^a-zA-Z0-9.\-_]/g, "") : null;

  // Resolve background: file upload (filename) OR remote URL
  const bgFilename = safeFilename(rawBody.backgroundPhotoFilename);
  let backgroundImagePath: string | null = bgFilename ? `${path.resolve("uploads")}/${bgFilename}` : null;
  if (!backgroundImagePath && rawBody.backgroundImageUrl) {
    backgroundImagePath = await downloadUrlToFile(String(rawBody.backgroundImageUrl), "bg");
  }

  // Resolve logo: file upload (filename) OR remote URL
  const logoFilename = safeFilename(rawBody.logoPhotoFilename);
  let logoImagePath: string | null = logoFilename ? `${path.resolve("uploads")}/${logoFilename}` : null;
  if (!logoImagePath && rawBody.logoImageUrl) {
    logoImagePath = await downloadUrlToFile(String(rawBody.logoImageUrl), "logo");
  }

  // Resolve custom overlay: file upload OR remote URL
  const overlayFilename = safeFilename(rawBody.overlayPhotoFilename);
  let overlayImagePath: string | null = overlayFilename ? `${path.resolve("uploads")}/${overlayFilename}` : null;
  if (!overlayImagePath && rawBody.overlayImageUrl) {
    overlayImagePath = await downloadUrlToFile(String(rawBody.overlayImageUrl), "overlay");
  }

  // Logo options: per-request overrides template defaults
  const logoText   = rawBody.logoText   ? String(rawBody.logoText).slice(0, 60) : (templateOverrides.logoText ?? null);
  const logoPos    = rawBody.logoPos    ? String(rawBody.logoPos)                : (templateOverrides.logoPos ?? "top-right");
  const logoInvert = rawBody.logoInvert !== undefined
    ? (rawBody.logoInvert === true || rawBody.logoInvert === "true")
    : (templateOverrides.logoInvert ?? false);
  const imgPosX    = rawBody.imgPositionX !== undefined ? Number(rawBody.imgPositionX) : 50;
  const imgPosY    = rawBody.imgPositionY !== undefined ? Number(rawBody.imgPositionY) : 50;

  // Typography/design: per-request overrides template defaults
  const fontSize   = rawBody.fontSize   ? Number(rawBody.fontSize)   : templateOverrides.fontSize;
  const fontWeight = rawBody.fontWeight ? Number(rawBody.fontWeight) : templateOverrides.fontWeight;
  const textShadow = rawBody.textShadow !== undefined
    ? (rawBody.textShadow === true || rawBody.textShadow === "true")
    : (templateOverrides.textShadow ?? false);
  const photoH     = rawBody.customPhotoHeight !== undefined
    ? Number(rawBody.customPhotoHeight)
    : templateOverrides.photoHeight;
  const customBannerColor = rawBody.customBannerColor ? String(rawBody.customBannerColor) : undefined;
  const customTextColor   = rawBody.customTextColor   ? String(rawBody.customTextColor)   : undefined;

  // Subtitle and label: per-request overrides template defaults
  const subtitle = body.subtitle !== undefined ? body.subtitle : (templateOverrides.subtitle ?? null);
  const label    = body.label    !== undefined ? body.label    : (templateOverrides.label    ?? null);

  // Logo image: if template has logoUrl and no per-request logo was provided, download it
  if (!logoImagePath && !logoText && !templateOverrides.logoText && templateOverrides.logoUrl) {
    const downloaded = await downloadUrlToFile(
      templateOverrides.logoUrl.startsWith("/api/")
        ? `http://localhost:8080${templateOverrides.logoUrl}`
        : templateOverrides.logoUrl,
      "logo_tpl"
    );
    if (downloaded) logoImagePath = downloaded;
  }

  // Text alignment: per-request overrides template defaults
  const headlineAlign = toAlign(rawBody.headlineAlign) ?? templateOverrides.headlineAlign;
  const subtitleAlign = toAlign(rawBody.subtitleAlign) ?? templateOverrides.subtitleAlign;
  const labelAlign    = toAlign(rawBody.labelAlign)    ?? templateOverrides.labelAlign;

  // Watermark: per-request overrides template defaults
  const watermarkText = rawBody.watermarkText
    ? String(rawBody.watermarkText).slice(0, 80)
    : (templateOverrides.watermarkText ?? null);
  const watermarkOpacity = rawBody.watermarkOpacity !== undefined
    ? Number(rawBody.watermarkOpacity)
    : templateOverrides.watermarkOpacity;

  // Generate image
  const { fileName, fileSize } = await generateCard({
    title: body.title,
    subtitle,
    label,
    aspectRatio: body.aspectRatio ?? "1:1",
    templateId: resolvedTemplateId,
    bannerColor: customBannerColor ?? body.bannerColor ?? templateOverrides.bannerColor,
    textColor: customTextColor ?? body.textColor ?? templateOverrides.textColor,
    labelColor: templateOverrides.labelColor,
    font: body.font ?? templateOverrides.font ?? "Cairo",
    fontSize,
    fontWeight,
    photoHeight: photoH,
    textShadow,
    backgroundImagePath,
    logoText,
    logoImagePath,
    logoPos,
    logoInvert,
    imgPositionX: imgPosX,
    imgPositionY: imgPosY,
    overlayImagePath,
    headlineAlign,
    subtitleAlign,
    labelAlign,
    watermarkText,
    watermarkOpacity,
    canvasLayout: (rawBody as any).canvasLayout ?? null,
  });

  const imageUrl = `/api/uploads/${fileName}`;

  // Save to history (only store numeric DB template IDs)
  const [generated] = await db.insert(generatedImagesTable).values({
    userId: user.id,
    templateId: dbTemplateNumericId,
    title: body.title,
    imageUrl,
    aspectRatio: body.aspectRatio ?? "1:1",
    fileSize,
  }).returning();

  // Increment usage counter
  await db.update(usersTable)
    .set({ imagesToday: user.imagesToday + 1 })
    .where(eq(usersTable.id, user.id));

  // Build absolute URL for convenience (useful for n8n / webhooks)
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host  = (req.headers["x-forwarded-host"] as string) || req.get("host") || "";
  const imageFullUrl = host ? `${proto}://${host}${imageUrl}` : imageUrl;

  res.status(201).json({
    id: generated.id,
    userId: generated.userId,
    templateId: generated.templateId,
    title: generated.title,
    imageUrl: generated.imageUrl,
    imageFullUrl,
    aspectRatio: generated.aspectRatio,
    createdAt: generated.createdAt,
  });
});

export default router;
