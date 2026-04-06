import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { generateApiKey } from "./auth";

const router = Router();

router.post("/keys/regenerate", requireAuth, async (req: AuthRequest, res) => {
  const newKey = generateApiKey();
  await db
    .update(usersTable)
    .set({ apiKey: newKey })
    .where(eq(usersTable.id, req.userId!));

  res.json({ apiKey: newKey });
});

export default router;
