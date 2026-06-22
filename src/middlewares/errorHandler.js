// -----------------------------------------------------------------------------
// Global error handler wired through bot.catch(). Logs the error and tries to
// inform the user without leaking internals.
// -----------------------------------------------------------------------------
import logger from '../utils/logger.js';
import messages from '../utils/messages.js';

/**
 * Handler passed to `bot.catch`.
 * @param {unknown} err
 * @param {import('telegraf').Context} ctx
 */
export const errorHandler = async (err, ctx) => {
  logger.error(`Unhandled error for update ${ctx?.update?.update_id}:`, err);

  try {
    if (ctx?.callbackQuery) {
      await ctx.answerCbQuery(messages.error).catch(() => {});
    } else if (ctx?.chat) {
      await ctx.reply(messages.error, { parse_mode: 'HTML' });
    }
  } catch (replyErr) {
    logger.error('Failed to deliver error message to user', replyErr);
  }
};

export default errorHandler;
