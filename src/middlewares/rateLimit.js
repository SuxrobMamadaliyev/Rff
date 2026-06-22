// -----------------------------------------------------------------------------
// Simple in-memory sliding-window rate limiter per user.
// Prevents a single user from flooding the bot with requests.
// -----------------------------------------------------------------------------
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Map<userId, number[]> -> timestamps of recent requests.
const hits = new Map();

/**
 * Telegraf middleware enforcing RATE_LIMIT_MAX requests per window.
 */
export const rateLimit = () => async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId) return next();

  const now = Date.now();
  const windowStart = now - config.security.rateLimitWindowMs;

  const timestamps = (hits.get(userId) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(userId, timestamps);

  if (timestamps.length > config.security.rateLimitMax) {
    logger.debug(`Rate limit hit for ${userId} (${timestamps.length})`);
    // Notify once per window when the limit is first exceeded.
    if (timestamps.length === config.security.rateLimitMax + 1) {
      try {
        await ctx.reply('⏳ Juda ko\'p so\'rov yubordingiz. Biroz kuting va qaytadan urinib ko\'ring.');
      } catch (_err) {
        // ignore delivery failures
      }
    }
    return undefined; // drop the update
  }

  return next();
};

// Periodically clear stale entries to avoid unbounded memory growth.
setInterval(() => {
  const windowStart = Date.now() - config.security.rateLimitWindowMs;
  for (const [userId, timestamps] of hits.entries()) {
    const fresh = timestamps.filter((t) => t > windowStart);
    if (fresh.length === 0) hits.delete(userId);
    else hits.set(userId, fresh);
  }
}, config.security.rateLimitWindowMs).unref();

export default rateLimit;
