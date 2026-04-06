import { Router, Request } from "express";
import { db } from "@workspace/db";
import { generatedImagesTable, templatesTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { generateCardImage, CardOptions } from "../lib/imageGenerator";
import { logger } from "../lib/logger";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
import { randomBytes } from "crypto";

const router = Router();

const UPLOADS_DIR = join(process.cwd(), "uploads");

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

function getDailyLimit(plan: string): number {
  switch (plan) {
    case "pro": return 500;
    case "enterprise": return 9999;
    default: return 20;
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getBaseUrl(req: Request): string {
  const host = req.get("host") || "localhost";
  const protocol = req.protocol || "http";
  return `${protocol}://${host}`;
}

router.post("/generate", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const rawBody = req.body;

  // Reset daily counter if needed
  const today = todayStr();
  if (user.lastResetDate !== today) {
    await db.update(usersTable)
      .set({ imagesToday: 0, lastResetDate: today })
      .where(eq(usersTable.id, user.id));
    user.imagesToday = 0;
  }

  const dailyLimit = getDailyLimit(user.plan);
  if (user.imagesToday >= dailyLimit) {
    res.status(429).json({ error: `Daily limit of ${dailyLimit} images reached` });
    return;
  }

  const {
    title,
    subtitle,
    label,
    templateId,
    aspectRatio = "1:1",
    backgroundPhotoFilename,
    logoPhotoFilename,
    // Extra fields from template or raw body
    bannerColor,
    bannerGradient,
    textColor,
    labelColor,
    font,
    fontSize,
    fontWeight,
    photoHeight,
    logoPos,
    logoInvert,
    textShadow,
    elements,
    backgroundUrl,
    logoUrl,
    overlayUrl,
  } = rawBody;

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  let cardOpts: CardOptions = {
    title,
    subtitle,
    label,
    aspectRatio,
    bannerColor: bannerColor || "#c0392b",
    bannerGradient: bannerGradient || null,
    textColor: textColor || "#ffffff",
    labelColor: labelColor || "#ffffff",
    font: font || "Cairo",
    fontSize: fontSize || 42,
    fontWeight: fontWeight || 700,
    photoHeight: photoHeight || 60,
    logoPos: logoPos || "top-left",
    logoInvert: logoInvert || false,
    textShadow: textShadow || false,
    elements: elements || "[]",
    overlayUrl: overlayUrl || null,
    backgroundPhotoUrl: null,
    logoPhotoUrl: null,
  };

  // Load template if provided
  let resolvedTemplateId: number | null = null;
  if (templateId) {
    const tId = typeof templateId === "string" ? parseInt(templateId, 10) : templateId;
    const templates = await db
      .select()
      .from(templatesTable)
      .where(and(eq(templatesTable.id, tId), eq(templatesTable.userId, user.id)))
      .limit(1);

    if (templates.length > 0) {
      const t = templates[0];
      resolvedTemplateId = t.id;
      cardOpts = {
        ...cardOpts,
        bannerColor: bannerColor || t.bannerColor,
        bannerGradient: bannerGradient || t.bannerGradient,
        textColor: textColor || t.textColor,
        labelColor: labelColor || t.labelColor,
        font: font || t.font,
        fontSize: fontSize || t.fontSize,
        fontWeight: fontWeight || t.fontWeight,
        photoHeight: photoHeight || t.photoHeight,
        logoPos: logoPos || t.logoPos,
        logoInvert: logoInvert !== undefined ? logoInvert : t.logoInvert,
        textShadow: textShadow !== undefined ? textShadow : t.textShadow,
        elements: elements || t.elements,
        overlayUrl: overlayUrl || t.overlayUrl,
        backgroundPhotoUrl: backgroundUrl || t.backgroundUrl || null,
        logoPhotoUrl: logoUrl || t.logoUrl || null,
      };
    }
  }

  // Resolve uploaded file URLs
  const baseUrl = getBaseUrl(req);
  if (backgroundPhotoFilename) {
    cardOpts.backgroundPhotoUrl = `${baseUrl}/api/uploads/${backgroundPhotoFilename}`;
  } else if (backgroundUrl) {
    cardOpts.backgroundPhotoUrl = backgroundUrl;
  }

  if (logoPhotoFilename) {
    cardOpts.logoPhotoUrl = `${baseUrl}/api/uploads/${logoPhotoFilename}`;
  } else if (logoUrl) {
    cardOpts.logoPhotoUrl = logoUrl;
  }

  try {
    logger.info({ title, aspectRatio }, "Generating image");
    const imageBuffer = await generateCardImage(cardOpts);

    await ensureUploadsDir();
    const filename = `gen_${randomBytes(8).toString("hex")}.png`;
    const filePath = join(UPLOADS_DIR, filename);
    await writeFile(filePath, imageBuffer);

    const imageUrl = `${baseUrl}/api/uploads/${filename}`;
    const fileSize = imageBuffer.length;

    // Save to DB
    const [generated] = await db.insert(generatedImagesTable).values({
      userId: user.id,
      templateId: resolvedTemplateId,
      title,
      imageUrl,
      aspectRatio,
      fileSize,
    }).returning();

    // Update daily counter
    await db.update(usersTable)
      .set({ imagesToday: user.imagesToday + 1 })
      .where(eq(usersTable.id, user.id));

    res.status(201).json(generated);
  } catch (err) {
    logger.error({ err }, "Image generation failed");
    res.status(500).json({ error: "Image generation failed" });
  }
});

export default router;
