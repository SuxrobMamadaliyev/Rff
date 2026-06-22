// -----------------------------------------------------------------------------
// Ban middleware: stops banned users from interacting with the bot.
// -----------------------------------------------------------------------------
import messages from '../utils/messages.js';

/**
 * Telegraf middleware blocking banned users.
 */
export const banGuard = () => async (ctx, next) => {
  const user = ctx.state.user;
  if (user?.isBanned) {
    try {
      if (ctx.callbackQuery) await ctx.answerCbQuery('🚫 Bloklangansiz', { show_alert: true });
      else await ctx.reply(messages.banned, { parse_mode: 'HTML' });
    } catch (_err) {
      // ignore delivery failures
    }
    return undefined; // stop processing
  }
  return next();
};

export default banGuard;
