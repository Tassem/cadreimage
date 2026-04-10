import { Router, type IRouter } from "express";
import { db, plansTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";
import { z } from "zod";
import { invalidatePlanCache, getPlanLimits, getUserUsage } from "../middlewares/planGuard";

const router: IRouter = Router();



const PlanBody = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9_-]+$/),
  priceMonthly: z.number().int().min(0).default(0),
  priceYearly: z.number().int().min(0).default(0),
  cardsPerDay: z.number().int().min(-1).default(5),
  maxTemplates: z.number().int().min(-1).default(2),
  maxSavedDesigns: z.number().int().min(-1).default(5),
  apiAccess: z.boolean().default(false),
  telegramBot: z.boolean().default(false),
  overlayUpload: z.boolean().default(false),
  customWatermark: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

// ── GET /plans  (public) ──────────────────────────────────────────────────────
router.get("/plans", async (_req, res): Promise<void> => {
  const plans = await db.select().from(plansTable).where(eq(plansTable.isActive, true)).orderBy(asc(plansTable.sortOrder));
  res.json(plans);
});

// ── GET /subscription  (auth) ────────────────────────────────────────────────
router.get("/subscription", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const user = req.user!;
  const limits = await getPlanLimits(user.plan);
  const usage  = await getUserUsage(user.id, user.plan);
  const plans  = await db.select().from(plansTable).orderBy(asc(plansTable.sortOrder));
  res.json({
    currentPlan: user.plan,
    limits,
    usage,
    plans,
  });
});

// ── Admin CRUD ────────────────────────────────────────────────────────────────

// GET /admin/plans
router.get("/admin/plans", requireAdmin, async (_req, res): Promise<void> => {
  const plans = await db.select().from(plansTable).orderBy(asc(plansTable.sortOrder));
  res.json(plans);
});

// POST /admin/plans
router.post("/admin/plans", requireAdmin, async (req, res): Promise<void> => {
  const parsed = PlanBody.safeParse(req.body);
  if (!parsed.success) { 
    console.error("Plan validation failed:", parsed.error);
    res.status(400).json({ error: "خطأ في البيانات: " + parsed.error.issues[0].message }); 
    return; 
  }
  const [created] = await db.insert(plansTable).values(parsed.data).returning();
  invalidatePlanCache();
  res.status(201).json(created);
});

// PUT /admin/plans/:id
router.put("/admin/plans/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = PlanBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [updated] = await db.update(plansTable).set(parsed.data).where(eq(plansTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Plan not found" }); return; }
  invalidatePlanCache();
  res.json(updated);
});

// DELETE /admin/plans/:id
router.delete("/admin/plans/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(plansTable).where(eq(plansTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Plan not found" }); return; }
  invalidatePlanCache();
  res.json({ success: true });
});

export default router;
