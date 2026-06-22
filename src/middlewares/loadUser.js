// -----------------------------------------------------------------------------
// Loads (or registers) the current user and attaches it to ctx.state.user.
// Subsequent middlewares/controllers rely on ctx.state.user being present.
// The /start payload is parsed here so referrals are attributed on first touch.
// -----------------------------------------------------------------------------
import { registerUser } from '../services/userService.js';
import { parseTelegramId } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Extract a referrer id from a /start command payload, if any.
 * @param {import('telegraf').Context} ctx
 * @returns {number|null}
 */
const extractReferrer = (ctx) => {
  const text = ctx.message?.text;
  if (!text || !text.startsWith('/start')) return null;
  const payload = text.split(' ')[1];
  return payload ? parseTelegramId(payload) : null;
};

/**
 * Telegraf middleware loading/registering the user.
 */
export const loadUser = () => async (ctx, next) => {
  if (!ctx.from || ctx.from.is_bot) return next();

  try {
    const referrerId = extractReferrer(ctx);
    const { user, isNew } = await registerUser(ctx.from, referrerId);
    ctx.state.user = user;
    ctx.state.isNewUser = isNew;
  } catch (err) {
    logger.error('loadUser failed', err);
  }

  return next();
};

export default loadUser;
