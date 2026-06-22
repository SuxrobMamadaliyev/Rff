// -----------------------------------------------------------------------------
// Route registration entry point. Admin routes are registered first so admin
// keyboard buttons take precedence, followed by user routes and a fallback.
// -----------------------------------------------------------------------------
import { registerAdminRoutes } from './adminRoutes.js';
import { registerUserRoutes } from './userRoutes.js';
import { handleUnknown } from '../controllers/menuController.js';

/**
 * Register every route on the bot.
 * @param {import('telegraf').Telegraf} bot
 */
export const registerRoutes = (bot) => {
  registerAdminRoutes(bot);
  registerUserRoutes(bot);

  // Fallback: any other text message gets the "unknown command" reply.
  bot.on('text', handleUnknown);
};

export default registerRoutes;
