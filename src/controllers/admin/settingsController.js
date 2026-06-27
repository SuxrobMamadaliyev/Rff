// -----------------------------------------------------------------------------
// Admin: view & toggle runtime settings + narxlar + karta.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import { Settings } from '../../models/index.js';
import config from '../../config/index.js';
import { formatMoney } from '../../utils/helpers.js';
import { SCENES, STARS_PRICES } from '../../utils/constants.js';

/**
 * Asosiy sozlamalar keyboard.
 */
const settingsKeyboard = (settings) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `Majburiy obuna: ${settings.subscriptionRequired ? '✅ Yoniq' : '❌ O\'chiq'}`,
        'settings:toggle_sub',
      ),
    ],
    [
      Markup.button.callback(
        `Bot holati: ${settings.botEnabled ? '✅ Faol' : '🔧 Texnik ishlar'}`,
        'settings:toggle_bot',
      ),
    ],
    [Markup.button.callback('💲 Narxlarni o\'zgartirish', 'settings:prices')],
    [Markup.button.callback('💳 Karta ma\'lumotlarini o\'zgartirish', 'settings:card')],
    [Markup.button.callback('⭐ Stars kursini o\'zgartirish', 'settings:stars_rate')],
    [Markup.button.callback('🎁 Referal bonus & minimal yechish', 'settings:economy')],
  ]);

/**
 * Sozlamalar ekranini ko'rsatish.
 */
export const showSettings = async (ctx) => {
  const settings = await Settings.getSettings();

  const starsBuyRate = settings.starsBuyRate ?? STARS_PRICES.BUY_RATE;
  const starsSellRate = settings.starsSellRate ?? STARS_PRICES.SELL_RATE;
  const cardNumber = settings.cardNumber ?? config.payments.cardNumber;
  const cardHolder = settings.cardHolder ?? config.payments.cardHolder;

  // Plan narxlari
  const planLines = config.plans.map((plan) => {
    const override = settings.planPrices?.find((p) => p.key === plan.key);
    const price = override?.price ?? plan.price;
    const stars = override?.stars ?? plan.stars;
    return `  • ${plan.title}: <b>${price.toLocaleString('ru-RU')} so'm</b> / <b>${stars}⭐</b>`;
  }).join('\n');

  const text =
    `⚙ <b>Sozlamalar</b>\n\n` +
    `🔒 Majburiy obuna: <b>${settings.subscriptionRequired ? 'Yoniq' : 'O\'chiq'}</b>\n` +
    `🤖 Bot holati: <b>${settings.botEnabled ? 'Faol' : 'Texnik ishlar'}</b>\n` +
    `🎁 Referal bonus: <b>${formatMoney(settings.referralBonus ?? config.economy.referralBonus)}</b>\n` +
    `💸 Minimal yechish: <b>${formatMoney(settings.minWithdrawal ?? config.economy.minWithdrawal)}</b>\n\n` +
    `💳 Karta: <code>${cardNumber}</code> (<b>${cardHolder}</b>)\n\n` +
    `⭐ Stars kursi:\n` +
    `  • Sotib olish: <b>1⭐ = ${starsBuyRate.toLocaleString('ru-RU')} so'm</b>\n` +
    `  • Sotish: <b>1⭐ = ${starsSellRate.toLocaleString('ru-RU')} so'm</b>\n\n` +
    `💲 <b>Premium narxlari:</b>\n${planLines}`;

  return ctx.reply(text, { parse_mode: 'HTML', ...settingsKeyboard(settings) });
};

/**
 * Majburiy obunani toggle.
 */
export const toggleSubscription = async (ctx) => {
  const settings = await Settings.getSettings();
  settings.subscriptionRequired = !settings.subscriptionRequired;
  await settings.save();
  await ctx.answerCbQuery(`Majburiy obuna: ${settings.subscriptionRequired ? 'yoniq' : 'o\'chiq'}`);
  return ctx.editMessageReplyMarkup(settingsKeyboard(settings).reply_markup);
};

/**
 * Bot holatini toggle.
 */
export const toggleBot = async (ctx) => {
  const settings = await Settings.getSettings();
  settings.botEnabled = !settings.botEnabled;
  await settings.save();
  await ctx.answerCbQuery(`Bot: ${settings.botEnabled ? 'faol' : 'texnik ishlar'}`);
  return ctx.editMessageReplyMarkup(settingsKeyboard(settings).reply_markup);
};

/**
 * Narxlar menyusini ko'rsatish.
 */
export const showPricesMenu = async (ctx) => {
  await ctx.answerCbQuery();
  const settings = await Settings.getSettings();

  const buttons = config.plans.map((plan) => {
    const override = settings.planPrices?.find((p) => p.key === plan.key);
    const price = override?.price ?? plan.price;
    const stars = override?.stars ?? plan.stars;
    return [
      Markup.button.callback(
        `${plan.title}: ${price.toLocaleString('ru-RU')} so'm / ${stars}⭐`,
        `${SCENES.ADMIN_EDIT_PLAN_PRICE}:${plan.key}`,
      ),
    ];
  });

  buttons.push([Markup.button.callback('⬅️ Orqaga', 'settings:back')]);

  const text = `💲 <b>Narxlarni o\'zgartirish</b>\n\nTarifni tanlang:`;
  try {
    return await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  } catch {
    return ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  }
};

/**
 * Karta menyusini ko'rsatish.
 */
export const showCardMenu = async (ctx) => {
  await ctx.answerCbQuery();
  const settings = await Settings.getSettings();
  const cardNumber = settings.cardNumber ?? config.payments.cardNumber;
  const cardHolder = settings.cardHolder ?? config.payments.cardHolder;

  const text =
    `💳 <b>Karta ma\'lumotlari</b>\n\n` +
    `Raqam: <code>${cardNumber}</code>\n` +
    `Egasi: <b>${cardHolder}</b>\n\n` +
    `O\'zgartirish uchun tugmani bosing:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('💳 Karta raqamini o\'zgartirish', 'settings:edit_card_number')],
    [Markup.button.callback('👤 Karta egasini o\'zgartirish', 'settings:edit_card_holder')],
    [Markup.button.callback('⬅️ Orqaga', 'settings:back')],
  ]);

  try {
    return await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
  } catch {
    return ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  }
};

/**
 * Iqtisodiy sozlamalar menyusi (referal bonus + minimal yechish).
 */
export const showEconomyMenu = async (ctx) => {
  await ctx.answerCbQuery();
  const settings = await Settings.getSettings();
  const referralBonus = settings.referralBonus ?? config.economy.referralBonus;
  const minWithdrawal = settings.minWithdrawal ?? config.economy.minWithdrawal;

  const text =
    `💰 <b>Iqtisodiy sozlamalar</b>\n\n` +
    `🎁 Referal bonus: <b>${formatMoney(referralBonus)}</b>\n` +
    `💸 Minimal yechish: <b>${formatMoney(minWithdrawal)}</b>\n\n` +
    `O\'zgartirish uchun tanlang:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🎁 Referal bonusni o\'zgartirish', 'settings:edit_referral_bonus')],
    [Markup.button.callback('💸 Minimal yechishni o\'zgartirish', 'settings:edit_min_withdrawal')],
    [Markup.button.callback('⬅️ Orqaga', 'settings:back')],
  ]);

  try {
    return await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
  } catch {
    return ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  }
};

/**
 * Stars kurs menyusini ko'rsatish.
 */
export const showStarsRateMenu = async (ctx) => {
  await ctx.answerCbQuery();
  const settings = await Settings.getSettings();
  const buyRate = settings.starsBuyRate ?? STARS_PRICES.BUY_RATE;
  const sellRate = settings.starsSellRate ?? STARS_PRICES.SELL_RATE;

  const text =
    `⭐ <b>Stars kursi</b>\n\n` +
    `Sotib olish: <b>1⭐ = ${buyRate.toLocaleString('ru-RU')} so'm</b>\n` +
    `Sotish: <b>1⭐ = ${sellRate.toLocaleString('ru-RU')} so'm</b>\n\n` +
    `O\'zgartirish uchun tanlang:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📈 Sotib olish kursini o\'zgartirish', 'settings:edit_buy_rate')],
    [Markup.button.callback('📉 Sotish kursini o\'zgartirish', 'settings:edit_sell_rate')],
    [Markup.button.callback('⬅️ Orqaga', 'settings:back')],
  ]);

  try {
    return await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
  } catch {
    return ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  }
};
