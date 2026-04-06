import { Router, type IRouter } from "express";
import { db, templatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { CreateTemplateBody, GetTemplateParams, UpdateTemplateParams, UpdateTemplateBody, DeleteTemplateParams } from "@workspace/api-zod";
import { checkTemplateLimit } from "../middlewares/planGuard";

const router: IRouter = Router();

function parseTemplate(t: Record<string, unknown>) {
  return {
    ...t,
    canvasLayout: t.canvasLayout
      ? (() => { try { return typeof t.canvasLayout === "string" ? JSON.parse(t.canvasLayout) : t.canvasLayout; } catch { return null; } })()
      : null,
  };
}

router.get("/templates", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const templates = await db
    .select()
    .from(templatesTable)
    .where(eq(templatesTable.userId, req.userId!))
    .orderBy(templatesTable.createdAt);

  res.json(templates.map(parseTemplate));
});

router.post("/templates", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check template limit for current plan
  const { allowed, used, limit } = await checkTemplateLimit(req.userId!, req.user!.plan);
  if (!allowed) {
    res.status(429).json({ error: `وصلت إلى الحد الأقصى للقوالب (${limit}). يرجى ترقية باقتك.`, limit, used });
    return;
  }

  const d = parsed.data;
  const [template] = await db.insert(templatesTable).values({
    userId: req.userId!,
    name: d.name,
    slug: d.slug ?? null,
    backgroundUrl: d.backgroundUrl ?? null,
    logoUrl: d.logoUrl ?? null,
    overlayUrl: d.overlayUrl ?? null,
    elements: d.elements ?? "[]",
    category: d.category ?? "news",
    aspectRatio: d.aspectRatio ?? "1:1",
    bannerColor: d.bannerColor ?? "#0f2557",
    bannerGradient: d.bannerGradient ?? null,
    textColor: d.textColor ?? "#ffffff",
    labelColor: d.labelColor ?? "rgba(255,255,255,0.85)",
    font: d.font ?? "Cairo",
    fontSize: d.fontSize ?? 26,
    fontWeight: d.fontWeight ?? 700,
    photoHeight: d.photoHeight ?? 62,
    subtitle: d.subtitle ?? null,
    label: d.label ?? null,
    logoText: d.logoText ?? null,
    logoPos: d.logoPos ?? "top-right",
    logoInvert: d.logoInvert ?? false,
    textShadow: d.textShadow ?? false,
    headlineAlign: d.headlineAlign ?? "right",
    subtitleAlign: d.subtitleAlign ?? "right",
    labelAlign: d.labelAlign ?? "right",
    watermarkText: d.watermarkText ?? null,
    watermarkOpacity: d.watermarkOpacity ?? "0.18",
    canvasLayout: d.canvasLayout ? JSON.stringify(d.canvasLayout) : null,
    isPublic: d.isPublic ?? false,
  }).returning();

  res.status(201).json(template);
});

router.get("/templates/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid template id" });
    return;
  }

  const [template] = await db
    .select()
    .from(templatesTable)
    .where(and(
      eq(templatesTable.id, params.data.id),
      eq(templatesTable.userId, req.userId!)
    ));

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json(parseTemplate(template as Record<string, unknown>));
});

router.put("/templates/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid template id" });
    return;
  }

  const parsed = UpdateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const [template] = await db
    .update(templatesTable)
    .set({
      ...(d.name !== undefined     && { name: d.name }),
      ...(d.slug !== undefined     && { slug: d.slug }),
      ...(d.backgroundUrl !== undefined && { backgroundUrl: d.backgroundUrl }),
      ...(d.logoUrl !== undefined  && { logoUrl: d.logoUrl }),
      ...(d.overlayUrl !== undefined && { overlayUrl: d.overlayUrl }),
      ...(d.elements !== undefined && { elements: d.elements }),
      ...(d.category !== undefined && { category: d.category }),
      ...(d.aspectRatio !== undefined && { aspectRatio: d.aspectRatio }),
      ...(d.bannerColor !== undefined && { bannerColor: d.bannerColor }),
      ...(d.bannerGradient !== undefined && { bannerGradient: d.bannerGradient }),
      ...(d.textColor !== undefined && { textColor: d.textColor }),
      ...(d.labelColor !== undefined && { labelColor: d.labelColor }),
      ...(d.font !== undefined     && { font: d.font }),
      ...(d.fontSize !== undefined && { fontSize: d.fontSize }),
      ...(d.fontWeight !== undefined && { fontWeight: d.fontWeight }),
      ...(d.photoHeight !== undefined && { photoHeight: d.photoHeight }),
      ...(d.subtitle !== undefined && { subtitle: d.subtitle }),
      ...(d.label !== undefined    && { label: d.label }),
      ...(d.logoText !== undefined && { logoText: d.logoText }),
      ...(d.logoPos !== undefined  && { logoPos: d.logoPos }),
      ...(d.logoInvert !== undefined && { logoInvert: d.logoInvert }),
      ...(d.textShadow !== undefined && { textShadow: d.textShadow }),
      ...(d.headlineAlign !== undefined && { headlineAlign: d.headlineAlign }),
      ...(d.subtitleAlign !== undefined && { subtitleAlign: d.subtitleAlign }),
      ...(d.labelAlign !== undefined && { labelAlign: d.labelAlign }),
      ...(d.watermarkText !== undefined && { watermarkText: d.watermarkText }),
      ...(d.watermarkOpacity !== undefined && { watermarkOpacity: d.watermarkOpacity }),
      ...(d.canvasLayout !== undefined && { canvasLayout: d.canvasLayout ? JSON.stringify(d.canvasLayout) : null }),
      ...(d.isPublic !== undefined && { isPublic: d.isPublic }),
    })
    .where(and(
      eq(templatesTable.id, params.data.id),
      eq(templatesTable.userId, req.userId!)
    ))
    .returning();

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json(parseTemplate(template as Record<string, unknown>));
});

router.delete("/templates/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid template id" });
    return;
  }

  const [template] = await db
    .delete(templatesTable)
    .where(and(
      eq(templatesTable.id, params.data.id),
      eq(templatesTable.userId, req.userId!)
    ))
    .returning();

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
