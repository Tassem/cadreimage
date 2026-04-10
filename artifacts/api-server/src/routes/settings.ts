import { Router, type IRouter } from "express";
import { db, systemSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";
import { startBotWithToken } from "../bot";

const router: IRouter = Router();

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db.select().from(systemSettingsTable).where(eq(systemSettingsTable.key, key));
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(systemSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: systemSettingsTable.key, set: { value, updatedAt: new Date() } });
}

router.get("/settings/telegram", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const token = await getSetting("telegram_bot_token");
  const hasToken = !!(process.env.TELEGRAM_BOT_TOKEN || token);
  let botUsername: string | null = null;
  let connected = false;

  const activeToken = process.env.TELEGRAM_BOT_TOKEN || token;
  if (activeToken) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${activeToken}/getMe`);
      const data = await r.json() as { ok: boolean; result?: { username?: string } };
      if (data.ok && data.result?.username) {
        connected = true;
        botUsername = data.result.username;
      }
    } catch {}
  }

  res.json({
    connected,
    hasToken,
    botUsername,
    tokenSource: process.env.TELEGRAM_BOT_TOKEN ? "env" : (token ? "db" : "none"),
    tokenMasked: activeToken ? `${activeToken.slice(0, 10)}...${activeToken.slice(-4)}` : null,
  });
});

router.put("/settings/telegram", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== "string" || token.trim().length < 20) {
    res.status(400).json({ error: "توكن غير صالح" });
    return;
  }

  const trimmed = token.trim();

  // Validate with Telegram before saving
  try {
    const r = await fetch(`https://api.telegram.org/bot${trimmed}/getMe`);
    const data = await r.json() as { ok: boolean; result?: { username?: string; first_name?: string }; description?: string };
    if (!data.ok) {
      res.status(400).json({ error: `توكن غير صالح: ${data.description ?? "فشل التحقق"}` });
      return;
    }

    await setSetting("telegram_bot_token", trimmed);

    // Start or restart bot with new token
    try {
      await startBotWithToken(trimmed);
    } catch (err) {
      // Non-fatal — token is saved, bot will start on next server restart
    }

    res.json({
      success: true,
      botUsername: data.result?.username,
      botName: data.result?.first_name,
    });
  } catch {
    res.status(500).json({ error: "تعذّر التحقق من التوكن. تأكد من الاتصال بالإنترنت." });
  }
});

router.delete("/settings/telegram", requireAuth, async (_req, res): Promise<void> => {
  await db.delete(systemSettingsTable).where(eq(systemSettingsTable.key, "telegram_bot_token"));
  res.json({ success: true });
});

export { getSetting };
export default router;
