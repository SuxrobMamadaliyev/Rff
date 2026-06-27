// -----------------------------------------------------------------------------
// Small, reusable helper functions.
// -----------------------------------------------------------------------------
import config from '../config/index.js';

export const formatMoney = (amount) => {
  const value = Number(amount || 0);
  return `${value.toLocaleString('ru-RU')} ${config.economy.currency}`;
};

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

export const buildReferralLink = (telegramId) =>
  `https://t.me/${config.bot.username}?start=${telegramId}`;

export const escapeHtml = (text) =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Statik config'dan plan topish (fallback uchun).
 */
export const findPlan = (key) => config.plans.find((plan) => plan.key === key);

/**
 * Settings'dan plan narxini olish (DB override yoki config fallback).
 * Settings modeli dinamik import qilinadi — circular dependency oldini oladi.
 */
export const findPlanWithPrices = async (key) => {
  const plan = config.plans.find((p) => p.key === key);
  if (!plan) return undefined;

  try {
    const { Settings } = await import('../models/index.js');
    const settings = await Settings.getSettings();
    const override = settings.planPrices?.find((p) => p.key === key);
    return {
      ...plan,
      price: override?.price ?? plan.price,
      stars: override?.stars ?? plan.stars,
    };
  } catch {
    return plan;
  }
};

/**
 * Barcha planlarni Settings override bilan qaytaradi.
 */
export const getAllPlansWithPrices = async () => {
  try {
    const { Settings } = await import('../models/index.js');
    const settings = await Settings.getSettings();
    return config.plans.map((plan) => {
      const override = settings.planPrices?.find((p) => p.key === plan.key);
      return {
        ...plan,
        price: override?.price ?? plan.price,
        stars: override?.stars ?? plan.stars,
      };
    });
  } catch {
    return config.plans;
  }
};

export const parseTelegramId = (text) => {
  if (!text) return null;
  const num = Number(text.trim());
  return Number.isInteger(num) && num > 0 ? num : null;
};

export const displayName = (user) => {
  if (!user) return 'Noma\'lum';
  const parts = [user.firstName, user.lastName].filter(Boolean);
  const name = parts.join(' ').trim();
  return name || `ID ${user.telegramId}`;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
