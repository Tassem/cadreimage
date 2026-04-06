import { Router } from "express";
import { db } from "@workspace/db";
import { templatesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { CreateTemplateBody, GetTemplateParams, UpdateTemplateBody, DeleteTemplateParams } from "@workspace/api-zod";

const router = Router();

router.get("/templates", requireAuth, async (req: AuthRequest, res) => {
  const templates = await db
    .select()
    .from(templatesTable)
    .where(eq(templatesTable.userId, req.userId!));
  res.json(templates);
});

router.post("/templates", requireAuth, async (req: AuthRequest, res) => {
  const parse = CreateTemplateBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const data = parse.data;
  const [template] = await db
    .insert(templatesTable)
    .values({
      userId: req.userId!,
      name: data.name ?? "Untitled",
      slug: data.slug ?? null,
      backgroundUrl: data.backgroundUrl ?? null,
      logoUrl: data.logoUrl ?? null,
      overlayUrl: data.overlayUrl ?? null,
      elements: data.elements ?? "[]",
      category: data.category ?? "general",
      aspectRatio: data.aspectRatio ?? "1:1",
      bannerColor: data.bannerColor ?? "#c0392b",
      bannerGradient: data.bannerGradient ?? null,
      textColor: data.textColor ?? "#ffffff",
      labelColor: data.labelColor ?? "#ffffff",
      font: data.font ?? "Cairo",
      fontSize: data.fontSize ?? 42,
      fontWeight: data.fontWeight ?? 700,
      photoHeight: data.photoHeight ?? 60,
      subtitle: data.subtitle ?? null,
      label: data.label ?? null,
      logoText: data.logoText ?? null,
      logoPos: data.logoPos ?? "top-left",
      logoInvert: data.logoInvert ?? false,
      textShadow: data.textShadow ?? false,
      isPublic: data.isPublic ?? false,
    })
    .returning();

  res.status(201).json(template);
});

router.get("/templates/:id", requireAuth, async (req: AuthRequest, res) => {
  const parse = GetTemplateParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const templates = await db
    .select()
    .from(templatesTable)
    .where(and(eq(templatesTable.id, parse.data.id), eq(templatesTable.userId, req.userId!)))
    .limit(1);

  if (templates.length === 0) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json(templates[0]);
});

router.put("/templates/:id", requireAuth, async (req: AuthRequest, res) => {
  const paramParse = DeleteTemplateParams.safeParse({ id: Number(req.params.id) });
  const bodyParse = UpdateTemplateBody.safeParse(req.body);
  if (!paramParse.success || !bodyParse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const existing = await db
    .select()
    .from(templatesTable)
    .where(and(eq(templatesTable.id, paramParse.data.id), eq(templatesTable.userId, req.userId!)))
    .limit(1);

  if (existing.length === 0) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  const data = bodyParse.data;
  const [updated] = await db
    .update(templatesTable)
    .set({
      ...(data.name !== undefined && { name: data.name ?? undefined }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.backgroundUrl !== undefined && { backgroundUrl: data.backgroundUrl }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.overlayUrl !== undefined && { overlayUrl: data.overlayUrl }),
      ...(data.elements !== undefined && { elements: data.elements ?? undefined }),
      ...(data.category !== undefined && { category: data.category ?? undefined }),
      ...(data.aspectRatio !== undefined && { aspectRatio: data.aspectRatio ?? undefined }),
      ...(data.bannerColor !== undefined && { bannerColor: data.bannerColor ?? undefined }),
      ...(data.bannerGradient !== undefined && { bannerGradient: data.bannerGradient }),
      ...(data.textColor !== undefined && { textColor: data.textColor ?? undefined }),
      ...(data.labelColor !== undefined && { labelColor: data.labelColor ?? undefined }),
      ...(data.font !== undefined && { font: data.font ?? undefined }),
      ...(data.fontSize !== undefined && { fontSize: data.fontSize ?? undefined }),
      ...(data.fontWeight !== undefined && { fontWeight: data.fontWeight ?? undefined }),
      ...(data.photoHeight !== undefined && { photoHeight: data.photoHeight ?? undefined }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.label !== undefined && { label: data.label }),
      ...(data.logoText !== undefined && { logoText: data.logoText }),
      ...(data.logoPos !== undefined && { logoPos: data.logoPos ?? undefined }),
      ...(data.logoInvert !== undefined && { logoInvert: data.logoInvert ?? undefined }),
      ...(data.textShadow !== undefined && { textShadow: data.textShadow ?? undefined }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic ?? undefined }),
      updatedAt: new Date(),
    })
    .where(eq(templatesTable.id, paramParse.data.id))
    .returning();

  res.json(updated);
});

router.delete("/templates/:id", requireAuth, async (req: AuthRequest, res) => {
  const parse = DeleteTemplateParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db
    .delete(templatesTable)
    .where(and(eq(templatesTable.id, parse.data.id), eq(templatesTable.userId, req.userId!)));

  res.status(204).end();
});

export default router;
