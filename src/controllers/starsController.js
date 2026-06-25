import { buyStarsKeyboard, sellStarsKeyboard, confirmStarsKeyboard } from '../keyboards/userKeyboards.js';
import { notifyAdmins } from '../services/notifyService.js';
import { STARS_PRICES, SCENES } from '../utils/constants.js';
import { formatMoney, displayName } from '../utils/helpers.js';

export const showBuyStars = async (ctx) => {
  await ctx.answerCbQuery();
  const text =
    `⭐ <b>Stars sotib olish</b>\n\n` +
    `Narx: <b>1 Stars = ${STARS_PRICES.BUY_RATE.toLocaleString('ru-RU')} so'm</b>\n\n` +
    `Miqdorni tanlang yoki o'zingiz kiriting 👇`;
  try {
    return await ctx.editMessageText(text, { parse_mode: 'HTML', ...buyStarsKeyboard() });
  } catch (_err) {
    return ctx.reply(text, { parse_mode: 'HTML', ...buyStarsKeyboard() });
  }
};

// Tugmadan miqdor tanlanganda — scene'ga kirib miqdorni saqlaymiz
export const handleBuyStarsAmount = async (ctx) => {
  await ctx.answerCbQuery();
  const amount = parseInt(ctx.match[1], 10);
  if (!amount || amount <= 0) {
    await ctx.answerCbQuery('Xato miqdor', { show_alert: true });
    return undefined;
  }
  // Scene'ga o'tamiz, miqdorni state orqali beramiz
  return ctx.scene.enter(SCENES.STARS_BUY, { presetAmount: amount });
};

// "Boshqa miqdor" — scene'ga oddiy kiramiz
export const handleBuyStarsCustom = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.STARS_BUY);
};

// Eski confirm — scene ichida hal qilinadi, saqlab qo'yamiz fallback sifatida
export const confirmBuyStars = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.STARS_BUY);
};

// ─── SOTISH ───────────────────────────────────────────────────────────────────

export const showSellStars = async (ctx) => {
  await ctx.answerCbQuery();
  const text =
    `💰 <b>Stars sotish</b>\n\n` +
    `Narx: <b>1 Stars = ${STARS_PRICES.SELL_RATE.toLocaleString('ru-RU')} so'm</b>\n\n` +
    `Miqdorni tanlang 👇`;
  try {
    return await ctx.editMessageText(text, { parse_mode: 'HTML', ...sellStarsKeyboard() });
  } catch (_err) {
    return ctx.reply(text, { parse_mode: 'HTML', ...sellStarsKeyboard() });
  }
};

export const handleSellStarsAmount = async (ctx) => {
  await ctx.answerCbQuery();
  const amount = parseInt(ctx.match[1], 10);
  if (!amount || amount <= 0) return ctx.answerCbQuery('Xato miqdor', { show_alert: true });
  const totalPrice = amount * STARS_PRICES.SELL_RATE;
  return ctx.editMessageText(
    `💰 <b>Tasdiqlash</b>\n\nMiqdor: <b>${amount} ⭐</b>\nOlasiz: <b>${formatMoney(totalPrice)}</b>\n\nDavom etasizmi?`,
    { parse_mode: 'HTML', ...confirmStarsKeyboard('sell', amount) },
  );
};

export const handleSellStarsCustom = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.STARS_SELL);
};

export const confirmSellStars = async (ctx) => {
  await ctx.answerCbQuery("✅ So'rov yuborildi");
  const amount = parseInt(ctx.match[2], 10);
  const totalPrice = amount * STARS_PRICES.SELL_RATE;
  const user = ctx.state.user;
  await ctx.editMessageText(
    `✅ <b>Qabul qilindi!</b>\n\n⭐ Miqdor: <b>${amount} Stars</b>\n💰 Olasiz: <b>${formatMoney(totalPrice)}</b>\n\nAdmin siz bilan bog'lanadi.`,
    { parse_mode: 'HTML' },
  );
  await notifyAdmins(
    ctx.telegram,
    `💰 <b>Stars sotish</b>\n\n👤 ${displayName(user)} (<code>${user.telegramId}</code>)\n⭐ ${amount} Stars\n💰 ${formatMoney(totalPrice)}`,
  );
};
