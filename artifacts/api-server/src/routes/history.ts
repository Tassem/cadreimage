import { Router } from "express";
import { db } from "@workspace/db";
import { generatedImagesTable, templatesTable, usersTable } from "@workspace/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { ListHistoryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  const parse = ListHistoryQueryParams.safeParse({
    limit: req.query.limit ? Number(req.query.limit) : 20,
    offset: req.query.offset ? Number(req.query.offset) : 0,
  });
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }

  const { limit, offset } = parse.data;

  const [images, total] = await Promise.all([
    db
      .select()
      .from(generatedImagesTable)
      .where(eq(generatedImagesTable.userId, req.userId!))
      .orderBy(desc(generatedImagesTable.createdAt))
      .limit(limit ?? 20)
      .offset(offset ?? 0),
    db
      .select({ count: count() })
      .from(generatedImagesTable)
      .where(eq(generatedImagesTable.userId, req.userId!)),
  ]);

  res.json({ images, total: total[0].count });
});

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;

  const [totalImages, totalTemplates] = await Promise.all([
    db.select({ count: count() }).from(generatedImagesTable).where(eq(generatedImagesTable.userId, req.userId!)),
    db.select({ count: count() }).from(templatesTable).where(eq(templatesTable.userId, req.userId!)),
  ]);

  const dailyLimit = user.plan === "pro" ? 500 : user.plan === "enterprise" ? 9999 : 20;

  res.json({
    totalImages: totalImages[0].count,
    imagesToday: user.imagesToday,
    totalTemplates: totalTemplates[0].count,
    plan: user.plan,
    dailyLimit,
  });
});

export default router;
