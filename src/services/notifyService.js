// -----------------------------------------------------------------------------
// Helpers to notify administrators about events that need moderation.
// -----------------------------------------------------------------------------
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Send an HTML message to every configured admin.
 * @param {import('telegraf').Telegram} telegram
 * @param {string} text
 * @param {object} [extra] - extra Telegram options (e.g. reply_markup)
 */
export const notifyAdmins = async (telegram, text, extra = {}) => {
  await Promise.all(
    config.adminIds.map(async (adminId) => {
      try {
        await telegram.sendMessage(adminId, text, { parse_mode: 'HTML', ...extra });
      } catch (err) {
        logger.warn(`Failed to notify admin ${adminId}: ${err.message}`);
      }
    }),
  );
};

/**
 * Safely send an HTML message to a single user (never throws).
 * @param {import('telegraf').Telegram} telegram
 * @param {number} telegramId
 * @param {string} text
 * @param {object} [extra]
 * @returns {Promise<boolean>} whether delivery succeeded
 */
export const notifyUser = async (telegram, telegramId, text, extra = {}) => {
  try {
    await telegram.sendMessage(telegramId, text, { parse_mode: 'HTML', ...extra });
    return true;
  } catch (err) {
    logger.warn(`Failed to notify user ${telegramId}: ${err.message}`);
    return false;
  }
};

export default { notifyAdmins, notifyUser };
