import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, generatedImagesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { requireAuth, signToken, type AuthRequest } from "../middlewares/auth";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

// ── requireAdmin middleware ────────────────────────────────────────────────────
async function requireAdmin(req: AuthRequest, res: any, next: any): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: "Forbidden: admin only" });
      return;
    }
    next();
  });
}

// ── POST /admin/login ─────────────────────────────────────────────────────────
router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user || !user.isAdmin) {
    res.status(401).json({ error: "صلاحيات غير كافية" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "البريد أو كلمة المرور غير صحيحة" });
    return;
  }

  const token = signToken(user.id);
  res.json({
    token,
    admin: { id: user.id, name: user.name, email: user.email },
  });
});

// ── GET /admin/stats ──────────────────────────────────────────────────────────
router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);

  const [{ total: totalUsers }] = await db
    .select({ total: count() })
    .from(usersTable);

  const [{ total: totalImages }] = await db
    .select({ total: count() })
    .from(generatedImagesTable);

  const [{ total: todayImages }] = await db
    .select({ total: count() })
    .from(generatedImagesTable)
    .where(sql`DATE(${generatedImagesTable.createdAt}) = ${today}`);

  const [{ total: proUsers }] = await db
    .select({ total: count() })
    .from(usersTable)
    .where(eq(usersTable.plan, "pro"));

  res.json({
    totalUsers: Number(totalUsers),
    totalImages: Number(totalImages),
    todayImages: Number(todayImages),
    proUsers: Number(proUsers),
    freeUsers: Number(totalUsers) - Number(proUsers),
  });
});

// ── GET /admin/users ──────────────────────────────────────────────────────────
router.get("/admin/users", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  const [imageCounts] = await db
    .select({
      userId: generatedImagesTable.userId,
      total: count(),
    })
    .from(generatedImagesTable)
    .groupBy(generatedImagesTable.userId);

  const countMap: Record<number, number> = {};
  const allCounts = await db
    .select({
      userId: generatedImagesTable.userId,
      total: count(),
    })
    .from(generatedImagesTable)
    .groupBy(generatedImagesTable.userId);

  allCounts.forEach(row => {
    countMap[row.userId] = Number(row.total);
  });

  res.json(
    users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      plan: u.plan,
      imagesToday: u.imagesToday,
      totalImages: countMap[u.id] ?? 0,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
    }))
  );
});

// ── PATCH /admin/users/:id ────────────────────────────────────────────────────
router.patch("/admin/users/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = Number(req.params.id);
  const { plan, isAdmin } = req.body as { plan?: string; isAdmin?: boolean };

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (plan === "free" || plan === "pro") updates.plan = plan;
  if (typeof isAdmin === "boolean") updates.isAdmin = isAdmin;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ id: updated.id, plan: updated.plan, isAdmin: updated.isAdmin });
});

// ── DELETE /admin/users/:id ───────────────────────────────────────────────────
router.delete("/admin/users/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = Number(req.params.id);
  if (req.userId === id) {
    res.status(400).json({ error: "Cannot delete yourself" });
    return;
  }

  await db.delete(generatedImagesTable).where(eq(generatedImagesTable.userId, id));
  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();

  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ success: true });
});

// ── GET /admin/images ─────────────────────────────────────────────────────────
router.get("/admin/images", requireAdmin, async (_req, res): Promise<void> => {
  const images = await db
    .select({
      id: generatedImagesTable.id,
      userId: generatedImagesTable.userId,
      title: generatedImagesTable.title,
      imageUrl: generatedImagesTable.imageUrl,
      aspectRatio: generatedImagesTable.aspectRatio,
      createdAt: generatedImagesTable.createdAt,
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from(generatedImagesTable)
    .leftJoin(usersTable, eq(generatedImagesTable.userId, usersTable.id))
    .orderBy(desc(generatedImagesTable.createdAt))
    .limit(100);

  res.json(images);
});

export default router;
