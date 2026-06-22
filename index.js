// -----------------------------------------------------------------------------
// Application entry point: validate config, connect to MongoDB, start an HTTP
// server (required by Render web services) and run the bot in webhook mode when
// a public domain is available, otherwise fall back to long polling.
// -----------------------------------------------------------------------------
import http from 'node:http';
import config, { validateConfig } from './src/config/index.js';
import { connectDatabase, disconnectDatabase } from './src/database/connection.js';
import { createBot, setupCommands } from './src/bot.js';
import logger from './src/utils/logger.js';

/**
 * Build a tiny HTTP server. In webhook mode it forwards Telegram updates to the
 * bot; it always answers GET / and /health with 200 so Render's health checks
 * (and uptime pings) succeed.
 * @param {import('telegraf').Telegraf} bot
 * @returns {http.Server}
 */
const createHttpServer = (bot) => {
  const webhookCallback = config.server.webhookDomain
    ? bot.webhookCallback(config.server.webhookPath, {
        secretToken: config.server.webhookSecret || undefined,
      })
    : null;

  return http.createServer((req, res) => {
    // Health check / root.
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
      return;
    }

    // Telegram webhook updates.
    if (webhookCallback && req.method === 'POST' && req.url === config.server.webhookPath) {
      webhookCallback(req, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
};

const main = async () => {
  // 1. Fail fast on misconfiguration.
  validateConfig();

  // 2. Database.
  await connectDatabase();

  // 3. Bot.
  const bot = createBot();
  await setupCommands(bot);

  // 4. HTTP server (Render requires a process listening on $PORT).
  const server = createHttpServer(bot);
  await new Promise((resolve) => server.listen(config.server.port, resolve));
  logger.info(`HTTP server listening on port ${config.server.port}`);

  // 5. Start the bot in the appropriate mode.
  if (config.server.webhookDomain) {
    const webhookUrl = `${config.server.webhookDomain}${config.server.webhookPath}`;
    await bot.telegram.setWebhook(webhookUrl, {
      secret_token: config.server.webhookSecret || undefined,
      drop_pending_updates: true,
    });
    logger.info(`Bot @${config.bot.username} running in WEBHOOK mode: ${webhookUrl}`);
  } else {
    // Long polling for local development. `launch()` resolves only after the
    // bot stops, so it is intentionally not awaited here.
    await bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
    bot.launch();
    logger.info(`Bot @${config.bot.username} running in POLLING mode (${config.env})`);
  }

  // 6. Graceful shutdown.
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down...`);
    bot.stop(signal);
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

main().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
