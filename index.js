// -----------------------------------------------------------------------------
// Application entry point: validate config, connect to MongoDB, launch the bot
// and wire graceful shutdown.
// -----------------------------------------------------------------------------
import config, { validateConfig } from './src/config/index.js';
import { connectDatabase, disconnectDatabase } from './src/database/connection.js';
import { createBot, setupCommands } from './src/bot.js';
import logger from './src/utils/logger.js';

const main = async () => {
  // 1. Fail fast on misconfiguration.
  validateConfig();

  // 2. Database.
  await connectDatabase();

  // 3. Bot.
  const bot = createBot();
  await setupCommands(bot);

  // 4. Launch (long polling). In Telegraf v4 `launch()` resolves only after the
  // bot stops, so we intentionally do NOT await it here and instead log once
  // polling has been established.
  bot.launch();
  logger.info(`Bot @${config.bot.username} started in ${config.env} mode`);

  // 5. Graceful shutdown.
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down...`);
    bot.stop(signal);
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
