import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, AuthRequest } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router = Router();

function generateApiKey(): string {
  return "ncg_" + randomBytes(24).toString("hex");
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

router.post("/auth/register", async (req, res) => {
  const parse = RegisterBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { name, email, password } = parse.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const apiKey = generateApiKey();

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    apiKey,
    plan: "free",
    imagesToday: 0,
    lastResetDate: todayStr(),
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
      imagesToday: user.imagesToday,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const parse = LoginBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { email, password } = parse.data;
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (users.length === 0) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken(user.id);

  // Reset daily counter if needed
  const today = todayStr();
  if (user.lastResetDate !== today) {
    await db.update(usersTable)
      .set({ imagesToday: 0, lastResetDate: today })
      .where(eq(usersTable.id, user.id));
    user.imagesToday = 0;
  }

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      apiKey: user.apiKey,
      imagesToday: user.imagesToday,
      createdAt: user.createdAt,
    },
  });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    apiKey: user.apiKey,
    imagesToday: user.imagesToday,
    createdAt: user.createdAt,
  });
});

export { getDailyLimit, todayStr, generateApiKey };
export default router;
