import { Router, type IRouter } from "express";
import { db, generatedImagesTable, templatesTable, usersTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { ListHistoryQueryParams } from "@workspace/api-zod";
import { v4 as uuidv4 } from "uuid";

const router: IRouter = Router();

const FREE_DAILY_LIMIT = 10;

router.get("/history", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ListHistoryQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = params.success ? (params.data.offset ?? 0) : 0;

  const images = await db
    .select()
    .from(generatedImagesTable)
    .where(eq(generatedImagesTable.userId, req.userId!))
    .orderBy(desc(generatedImagesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(generatedImagesTable)
    .where(eq(generatedImagesTable.userId, req.userId!));

  res.json({ images, total: Number(total) });
});

router.get("/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const user = req.user!;

  const [{ value: totalImages }] = await db
    .select({ value: count() })
    .from(generatedImagesTable)
    .where(eq(generatedImagesTable.userId, req.userId!));

  const [{ value: totalTemplates }] = await db
    .select({ value: count() })
    .from(templatesTable)
    .where(eq(templatesTable.userId, req.userId!));

  // Reset today count if needed
  const today = new Date().toISOString().slice(0, 10);
  const imagesToday = user.lastResetDate === today ? user.imagesToday : 0;

  res.json({
    totalImages: Number(totalImages),
    imagesToday,
    totalTemplates: Number(totalTemplates),
    plan: user.plan,
    dailyLimit: user.plan === "pro" ? -1 : FREE_DAILY_LIMIT,
  });
});

router.post("/keys/regenerate", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const newApiKey = `ncg_${uuidv4().replace(/-/g, "")}`;

  await db.update(usersTable)
    .set({ apiKey: newApiKey })
    .where(eq(usersTable.id, req.userId!));

  res.json({ apiKey: newApiKey });
});

export default router;
