// -----------------------------------------------------------------------------
// Mandatory subscription checks against the configured Telegram channels.
// -----------------------------------------------------------------------------
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Telegram member statuses that count as "subscribed".
const ACTIVE_STATUSES = new Set(['creator', 'administrator', 'member']);

/**
 * Check whether a user is a member of a single channel.
 * @param {import('telegraf').Telegram} telegram
 * @param {string|number} channelId
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
const isMemberOf = async (telegram, channelId, userId) => {
  try {
    const member = await telegram.getChatMember(channelId, userId);
    return ACTIVE_STATUSES.has(member.status);
  } catch (err) {
    // Most common cause: the bot is not an admin in that channel.
    logger.warn(`Subscription check failed for ${channelId}: ${err.message}`);
    return false;
  }
};

/**
 * Check membership across all required channels.
 * @param {import('telegraf').Telegram} telegram
 * @param {number} userId
 * @returns {Promise<{ subscribed: boolean, missing: typeof config.channels }>}
 */
export const checkSubscription = async (telegram, userId) => {
  if (config.channels.length === 0) {
    return { subscribed: true, missing: [] };
  }

  const results = await Promise.all(
    config.channels.map(async (channel) => ({
      channel,
      ok: await isMemberOf(telegram, channel.id, userId),
    })),
  );

  const missing = results.filter((r) => !r.ok).map((r) => r.channel);
  return { subscribed: missing.length === 0, missing };
};

export default checkSubscription;
