import app from "./app";
import { logger } from "./lib/logger";
import { startBot } from "./bot";
import { closeBrowser } from "./lib/imageGenerator";
import { getSetting } from "./routes/settings";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// Graceful shutdown - close playwright browser
process.on("SIGTERM", async () => {
  await closeBrowser();
  process.exit(0);
});
process.on("SIGINT", async () => {
  await closeBrowser();
  process.exit(0);
});

// Prevent unhandled promise rejections (e.g. Telegraf polling on network issues) from crashing
process.on("unhandledRejection", (reason, promise) => {
  logger.warn({ reason, promise }, "Unhandled rejection — caught at top level");
});
process.on("uncaughtException", (err) => {
  logger.warn({ err }, "Uncaught exception — caught at top level");
});

// Start Telegram bot: check env var first, then DB
(async () => {
  const envToken = process.env.TELEGRAM_BOT_TOKEN;
  const dbToken  = envToken ? null : await getSetting("telegram_bot_token").catch(() => null);
  const token    = envToken || dbToken;

  if (token) {
    // Temporarily set for bot.ts BOT_TOKEN constant
    if (!envToken && dbToken) process.env.TELEGRAM_BOT_TOKEN = dbToken;
    startBot().catch((err) => {
      logger.error({ err }, "Failed to start Telegram bot");
    });
  } else {
    logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled");
  }
})();
