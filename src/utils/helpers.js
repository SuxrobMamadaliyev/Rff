// -----------------------------------------------------------------------------
// Small, reusable helper functions.
// -----------------------------------------------------------------------------
import config from '../config/index.js';

/**
 * Format a number as a money string with thousands separators + currency label.
 * @param {number} amount
 * @returns {string}
 */
export const formatMoney = (amount) => {
  const value = Number(amount || 0);
  return `${value.toLocaleString('ru-RU')} ${config.economy.currency}`;
};

/**
 * Format a Date as a human readable string (Tashkent friendly, 24h).
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Build the referral deep-link for a given Telegram id.
 * @param {number|string} telegramId
 * @returns {string}
 */
export const buildReferralLink = (telegramId) =>
  `https://t.me/${config.bot.username}?start=${telegramId}`;

/**
 * Escape characters that are unsafe inside Telegram HTML parse mode.
 * @param {string} text
 * @returns {string}
 */
export const escapeHtml = (text) =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Find a configured plan by its key.
 * @param {string} key
 * @returns {import('../config/index.js').default['plans'][number]|undefined}
 */
export const findPlan = (key) => config.plans.find((plan) => plan.key === key);

/**
 * Render a username/full name safely for display.
 * @param {{username?:string, firstName?:string, lastName?:string, telegramId?:number}} user
 * @returns {string}
 */
export const displayName = (user) => {
  if (!user) return 'Foydalanuvchi';
  if (user.username) return `@${user.username}`;
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || `ID ${user.telegramId}`;
};

/**
 * Pause helper used to throttle bulk broadcasts and respect Telegram limits.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract a Telegram id from raw text input (accepts plain id or @username
 * is rejected here - callers that need username lookup handle it separately).
 * @param {string} text
 * @returns {number|null}
 */
export const parseTelegramId = (text) => {
  const value = Number(String(text || '').trim());
  return Number.isInteger(value) && value > 0 ? value : null;
};
