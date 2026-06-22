// -----------------------------------------------------------------------------
// Broadcasting helpers: send a text advert or forward a message to all users.
// Respects Telegram rate limits by chunking + sleeping between batches.
// -----------------------------------------------------------------------------
import { User } from '../models/index.js';
import { sleep } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 1000;

/**
 * Iterate over every non-banned user and invoke `send(telegramId)`.
 * Returns delivery statistics.
 * @param {(telegramId:number)=>Promise<void>} send
 * @returns {Promise<{ total:number, sent:number, failed:number }>}
 */
const deliverToAll = async (send) => {
  const users = await User.find({ isBanned: false }).select('telegramId').lean();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      batch.map(async ({ telegramId }) => {
        try {
          await send(telegramId);
          sent += 1;
        } catch (err) {
          failed += 1;
          logger.debug(`Broadcast failed for ${telegramId}: ${err.message}`);
        }
      }),
    );
    // eslint-disable-next-line no-await-in-loop
    await sleep(BATCH_DELAY_MS);
  }

  return { total: users.length, sent, failed };
};

/**
 * Broadcast a plain HTML text to all users.
 * @param {import('telegraf').Telegram} telegram
 * @param {string} text
 */
export const broadcastText = (telegram, text) =>
  deliverToAll((telegramId) =>
    telegram.sendMessage(telegramId, text, { parse_mode: 'HTML' }),
  );

/**
 * Forward a message (copy) to all users, preserving media.
 * @param {import('telegraf').Telegram} telegram
 * @param {number} fromChatId
 * @param {number} messageId
 */
export const broadcastForward = (telegram, fromChatId, messageId) =>
  deliverToAll((telegramId) => telegram.copyMessage(telegramId, fromChatId, messageId));

export default { broadcastText, broadcastForward };
