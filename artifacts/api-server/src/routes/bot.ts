import { Router } from "express";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/bot/status", requireAuth, async (_req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.json({ connected: false });
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await r.json() as { ok: boolean; result?: { username?: string } };
    if (data.ok && data.result?.username) {
      return res.json({ connected: true, username: data.result.username });
    }
    return res.json({ connected: false });
  } catch {
    return res.json({ connected: false });
  }
});

export default router;
