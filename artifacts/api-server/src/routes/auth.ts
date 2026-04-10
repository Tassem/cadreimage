import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { getPlanLimits } from "../middlewares/planGuard";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const apiKey = `ncg_${uuidv4().replace(/-/g, "")}`;
  const today = new Date().toISOString().slice(0, 10);
  const botCode = `NB-${Math.floor(1000 + Math.random() * 9000)}`;

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    apiKey,
    plan: "free",
    imagesToday: 0,
    lastResetDate: today,
    botCode,
  }).returning();

  const token = signToken(user.id);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      apiKey: user.apiKey,
      botCode: user.botCode,
      isAdmin: user.isAdmin,
      imagesToday: user.imagesToday,
      planDetails: await getPlanLimits(user.plan),
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      apiKey: user.apiKey,
      botCode: user.botCode,
      isAdmin: user.isAdmin,
      imagesToday: user.imagesToday,
      planDetails: await getPlanLimits(user.plan),
      createdAt: user.createdAt,
    },
  });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const user = req.user!;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    apiKey: user.apiKey,
    botCode: user.botCode,
    isAdmin: user.isAdmin,
    imagesToday: user.imagesToday,
    planDetails: await getPlanLimits(user.plan),
    createdAt: user.createdAt,
  });
});

// Regenerate API key
router.post("/auth/regenerate-key", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const user = req.user!;
  const newKey = `ncg_${uuidv4().replace(/-/g, "")}`;
  await db.update(usersTable).set({ apiKey: newKey }).where(eq(usersTable.id, user.id));
  res.json({ apiKey: newKey });
});

export default router;
