// -----------------------------------------------------------------------------
// Centralized application configuration.
// All environment variables are read here once and exported as a frozen object
// so the rest of the codebase never touches process.env directly.
// -----------------------------------------------------------------------------
import dotenv from 'dotenv';

dotenv.config();

/**
 * Parse a comma separated list of admin ids into an array of numbers.
 * @param {string|undefined} raw
 * @returns {number[]}
 */
const parseAdminIds = (raw) =>
  (raw || '')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

/**
 * Read a numeric env var with a fallback default.
 * @param {string|undefined} value
 * @param {number} fallback
 * @returns {number}
 */
const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  bot: {
    token: process.env.BOT_TOKEN,
    username: (process.env.BOT_USERNAME || '').replace('@', ''),
  },

  // HTTP server / webhook settings (used on Render and other PaaS).
  // When `webhookDomain` is set the bot runs in webhook mode behind an HTTP
  // server bound to `port`; otherwise it falls back to long polling.
  // Render automatically provides RENDER_EXTERNAL_URL, so no manual setup needed.
  server: {
    port: num(process.env.PORT, 3000),
    webhookDomain: (process.env.WEBHOOK_DOMAIN || process.env.RENDER_EXTERNAL_URL || '')
      .trim()
      .replace(/\/$/, ''),
    webhookPath: process.env.WEBHOOK_PATH || '/telegraf',
    webhookSecret: process.env.WEBHOOK_SECRET || '',
  },

  adminIds: parseAdminIds(process.env.ADMIN_IDS),

  channels: [
    {
      id: process.env.REQUIRED_CHANNEL_1,
      link: process.env.REQUIRED_CHANNEL_1_LINK,
      title: '1-kanal',
    },
    {
      id: process.env.REQUIRED_CHANNEL_2,
      link: process.env.REQUIRED_CHANNEL_2_LINK,
      title: '2-kanal',
    },
  ].filter((channel) => Boolean(channel.id)),

  db: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/premium_shop_bot',
  },

  economy: {
    currency: process.env.CURRENCY || "so'm",
    referralBonus: num(process.env.REFERRAL_BONUS, 5000),
    minWithdrawal: num(process.env.MIN_WITHDRAWAL, 10000),
  },

  // Premium plans. `key` is the stable identifier used in callback data.
  plans: [
    {
      key: '3m',
      months: 3,
      title: '3 oylik Premium',
      price: num(process.env.PRICE_3_MONTHS, 120000),
      stars: num(process.env.STARS_3_MONTHS, 500),
      description: 'Telegram Premium - 3 oy. Barcha Premium imkoniyatlari.',
    },
    {
      key: '6m',
      months: 6,
      title: '6 oylik Premium',
      price: num(process.env.PRICE_6_MONTHS, 210000),
      stars: num(process.env.STARS_6_MONTHS, 900),
      description: 'Telegram Premium - 6 oy. Eng ommabop tarif.',
    },
    {
      key: '12m',
      months: 12,
      title: '12 oylik Premium',
      price: num(process.env.PRICE_12_MONTHS, 380000),
      stars: num(process.env.STARS_12_MONTHS, 1600),
      description: 'Telegram Premium - 12 oy. Eng foydali tarif.',
    },
  ],

  payments: {
    cardNumber: process.env.CARD_NUMBER || '0000 0000 0000 0000',
    cardHolder: process.env.CARD_HOLDER || 'Admin',
    clickLink: process.env.CLICK_LINK || '',
    paymeLink: process.env.PAYME_LINK || '',
    uzumLink: process.env.UZUM_LINK || '',
  },

  security: {
    rateLimitMax: num(process.env.RATE_LIMIT_MAX, 20),
    rateLimitWindowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 10000),
  },
};

/**
 * Validate the critical configuration and throw early with a helpful message.
 */
export const validateConfig = () => {
  const errors = [];

  if (!config.bot.token) errors.push('BOT_TOKEN is required');
  if (!config.bot.username) errors.push('BOT_USERNAME is required');
  if (config.adminIds.length === 0) errors.push('At least one ADMIN_IDS entry is required');
  if (!config.db.uri) errors.push('MONGODB_URI is required');
  if (config.channels.length < 2) {
    errors.push('Two required channels (REQUIRED_CHANNEL_1/2) must be configured');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid configuration:\n - ${errors.join('\n - ')}`);
  }
};

/**
 * @param {number} id
 * @returns {boolean} whether the given Telegram id belongs to an admin.
 */
export const isAdmin = (id) => config.adminIds.includes(Number(id));

export default Object.freeze(config);
