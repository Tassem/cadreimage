import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, userSavedDesignsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { checkDesignLimit } from "../middlewares/planGuard";

const router = Router();

// GET /api/designs — list user's saved designs
router.get("/designs", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const designs = await db
    .select()
    .from(userSavedDesignsTable)
    .where(eq(userSavedDesignsTable.userId, userId))
    .orderBy(userSavedDesignsTable.createdAt);
  return res.json({ designs });
});

// POST /api/designs — save a design
router.post("/designs", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const planSlug = (req as any).user.plan ?? "free";
  const { name, settings } = req.body as { name: string; settings: unknown };
  if (!name || !settings) return res.status(400).json({ error: "name and settings required" });

  // Upsert by name — if name exists for this user, update it (no limit check for updates)
  const [existing] = await db
    .select()
    .from(userSavedDesignsTable)
    .where(and(eq(userSavedDesignsTable.userId, userId), eq(userSavedDesignsTable.name, name)));

  let design;
  if (existing) {
    [design] = await db
      .update(userSavedDesignsTable)
      .set({ settings })
      .where(eq(userSavedDesignsTable.id, existing.id))
      .returning();
  } else {
    // Check limit only for new designs
    const { allowed, used, limit } = await checkDesignLimit(userId, planSlug);
    if (!allowed) {
      return res.status(429).json({ error: `وصلت إلى الحد الأقصى للتصاميم المحفوظة (${limit}). يرجى ترقية باقتك.`, limit, used });
    }
    [design] = await db
      .insert(userSavedDesignsTable)
      .values({ userId, name, settings })
      .returning();
  }

  return res.json({ design });
});

// DELETE /api/designs/:id
router.delete("/designs/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const id = Number(req.params.id);
  await db
    .delete(userSavedDesignsTable)
    .where(and(eq(userSavedDesignsTable.id, id), eq(userSavedDesignsTable.userId, userId)));
  return res.json({ ok: true });
});

export default router;
