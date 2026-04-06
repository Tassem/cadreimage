import { Router } from "express";
import { db } from "@workspace/db";
import { userSavedDesignsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/designs", requireAuth, async (req: AuthRequest, res) => {
  const designs = await db
    .select()
    .from(userSavedDesignsTable)
    .where(eq(userSavedDesignsTable.userId, req.userId!))
    .orderBy(desc(userSavedDesignsTable.updatedAt));
  res.json(designs);
});

router.post("/designs", requireAuth, async (req: AuthRequest, res) => {
  const { name, designData, previewUrl } = req.body;
  if (!name || !designData) {
    res.status(400).json({ error: "name and designData are required" });
    return;
  }

  const [design] = await db.insert(userSavedDesignsTable).values({
    userId: req.userId!,
    name,
    designData: typeof designData === "string" ? designData : JSON.stringify(designData),
    previewUrl: previewUrl || null,
  }).returning();

  res.status(201).json(design);
});

router.get("/designs/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const designs = await db
    .select()
    .from(userSavedDesignsTable)
    .where(and(eq(userSavedDesignsTable.id, id), eq(userSavedDesignsTable.userId, req.userId!)))
    .limit(1);

  if (designs.length === 0) {
    res.status(404).json({ error: "Design not found" });
    return;
  }

  res.json(designs[0]);
});

router.put("/designs/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { name, designData, previewUrl } = req.body;

  const existing = await db
    .select()
    .from(userSavedDesignsTable)
    .where(and(eq(userSavedDesignsTable.id, id), eq(userSavedDesignsTable.userId, req.userId!)))
    .limit(1);

  if (existing.length === 0) {
    res.status(404).json({ error: "Design not found" });
    return;
  }

  const [updated] = await db
    .update(userSavedDesignsTable)
    .set({
      ...(name !== undefined && { name }),
      ...(designData !== undefined && { designData: typeof designData === "string" ? designData : JSON.stringify(designData) }),
      ...(previewUrl !== undefined && { previewUrl }),
      updatedAt: new Date(),
    })
    .where(eq(userSavedDesignsTable.id, id))
    .returning();

  res.json(updated);
});

router.delete("/designs/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  await db
    .delete(userSavedDesignsTable)
    .where(and(eq(userSavedDesignsTable.id, id), eq(userSavedDesignsTable.userId, req.userId!)));
  res.status(204).end();
});

export default router;
