// -----------------------------------------------------------------------------
// Bot factory: builds the Telegraf instance, wires middlewares (in order),
// scenes and routes, and attaches the global error handler.
//
// Middleware order matters:
//   session -> rateLimit -> antiSpam -> loadUser -> banGuard
//   -> stage (scenes) -> subscriptionGuard -> routes
// -----------------------------------------------------------------------------
import { Telegraf, session } from 'telegraf';
import config from './config/index.js';
import {
  rateLimit,
  antiSpam,
  loadUser,
  banGuard,
  subscriptionGuard,
  errorHandler,
} from './middlewares/index.js';
import { buildStage } from './scenes/index.js';
import { registerRoutes } from './routes/index.js';
import { Settings } from './models/index.js';
import { isAdmin } from './config/index.js';
import logger from './utils/logger.js';

/**
 * Maintenance gate: when the bot is disabled, only admins may interact.
 */
const maintenanceGuard = () => async (ctx, next) => {
  if (isAdmin(ctx.from?.id)) return next();
  const settings = await Settings.getSettings();
  if (!settings.botEnabled) {
    try {
      await ctx.reply(settings.maintenanceMessage);
    } catch (_err) {
      // ignore
    }
    return undefined;
  }
  return next();
};

/**
 * Build and configure the bot (without launching it).
 * @returns {import('telegraf').Telegraf}
 */
export const createBot = () => {
  const bot = new Telegraf(config.bot.token, { handlerTimeout: 60_000 });

  // 1. Session store (required by scenes).
  bot.use(session());

  // 2. Security middlewares.
  bot.use(rateLimit());
  bot.use(antiSpam());

  // 3. Identity: load/register the user (sets ctx.state.user).
  bot.use(loadUser());

  // 4. Maintenance + ban guards.
  bot.use(maintenanceGuard());
  bot.use(banGuard());

  // 5. Scenes (wizard flows). Users inside a scene are handled here.
  bot.use(buildStage().middleware());

  // 6. Mandatory subscription (after scenes so active flows aren't interrupted).
  bot.use(subscriptionGuard());

  // 7. Application routes.
  registerRoutes(bot);

  // 8. Global error handler.
  bot.catch(errorHandler);

  return bot;
};

/**
 * Configure the visible command list shown in the Telegram client menu.
 * @param {import('telegraf').Telegraf} bot
 */
export const setupCommands = async (bot) => {
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Botni ishga tushirish' },
      { command: 'cancel', description: 'Joriy amalni bekor qilish' },
    ]);
  } catch (err) {
    logger.warn(`Failed to set bot commands: ${err.message}`);
  }
};

export default createBot;
