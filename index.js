import http from 'node:http';
import config, { validateConfig } from './src/config/index.js';
import { connectDatabase, disconnectDatabase } from './src/database/connection.js';
import { createBot, setupCommands } from './src/bot.js';
import logger from './src/utils/logger.js';

const createHttpServer = (bot) => {
  const webhookCallback = config.server.webhookDomain
    ? bot.webhookCallback(config.server.webhookPath, {
        secretToken: config.server.webhookSecret || undefined,
      })
    : null;

  return http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
      return;
    }
    if (webhookCallback && req.method === 'POST' && req.url === config.server.webhookPath) {
      webhookCallback(req, res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
};

const main = async () => {
  validateConfig();
  await connectDatabase();

  const bot = createBot();
  await setupCommands(bot);

  const server = createHttpServer(bot);
  await new Promise((resolve) => server.listen(config.server.port, resolve));
  logger.info(`HTTP server listening on port ${config.server.port}`);

  if (config.server.webhookDomain) {
    const webhookUrl = `${config.server.webhookDomain}${config.server.webhookPath}`;
    await bot.telegram.setWebhook(webhookUrl, {
      secret_token: config.server.webhookSecret || undefined,
      drop_pending_updates: true,
      // Barcha kerakli update turlarini qo'shamiz
      allowed_updates: [
        'message',
        'callback_query',
        'pre_checkout_query',
        'my_chat_member',
        'chat_member',
      ],
    });
    logger.info(`Bot @${config.bot.username} running in WEBHOOK mode: ${webhookUrl}`);
  } else {
    await bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
    bot.launch({
      allowedUpdates: [
        'message',
        'callback_query',
        'pre_checkout_query',
        'my_chat_member',
      ],
    });
    logger.info(`Bot @${config.bot.username} running in POLLING mode (${config.env})`);
  }

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

