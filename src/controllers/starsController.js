import { buyStarsKeyboard, sellStarsKeyboard, confirmStarsKeyboard } from '../keyboards/userKeyboards.js';
import { notifyAdmins } from '../services/notifyService.js';
import { STARS_PRICES, SCENES } from '../utils/constants.js';
import { formatMoney, displayName } from '../utils/helpers.js';

export const showBuyStars = async (ctx) => {
  await ctx.answerCbQuery();
  const text = `⭐ <b>Stars sotib olish</b>\n\nNarx: <b>1 Stars = ${STARS_PRICES.BUY_RATE.toLocaleString('ru-RU')} so'm</b>\n\nMiqdorni tanlang 👇`;
  try {
    return await ctx.editMessageText(text, { parse_mode: 'HTML', ...buyStarsKeyboard() });
  } catch (_err) {
    return ctx.reply(text, { parse_mode: 'HTML', ...buyStarsKeyboard() });
  }
};

export const handleBuyStarsAmount = async (ctx) => {
  await ctx.answerCbQuery();
  const amount = parseInt(ctx.match[1], 10);
  if (!amount || amount <= 0) return ctx.answerCbQuery('Xato miqdor', { show_alert: true });
  const totalPrice = amount * STARS_PRICES.BUY_RATE;
  return ctx.editMessageText(
    `⭐ <b>Tasdiqlash</b>\n\nMiqdor: <b>${amount} ⭐</b>\nNarx: <b>${formatMoney(totalPrice)}</b>\n\nDavom etasizmi?`,
    { parse_mode: 'HTML', ...confirmStarsKeyboard('buy', amount) },
  );
};

export const handleBuyStarsCustom = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.STARS_BUY);
};

export const confirmBuyStars = async (ctx) => {
  await ctx.answerCbQuery("✅ So'rov yuborildi");
  const amount = parseInt(ctx.match[2], 10);
  const totalPrice = amount * STARS_PRICES.BUY_RATE;
  const user = ctx.state.user;
  await ctx.editMessageText(
    `✅ <b>Qabul qilindi!</b>\n\n⭐ Miqdor: <b>${amount} Stars</b>\n💰 To'lov: <b>${formatMoney(totalPrice)}</b>\n\nAdmin bilan bog'laning.`,
    { parse_mode: 'HTML' },
  );
  await notifyAdmins(ctx.telegram,
    `⭐ <b>Stars sotib olish</b>\n\n👤 ${displayName(user)} (<code>${user.telegramId}</code>)\n⭐ ${amount} Stars\n💰 ${formatMoney(totalPrice)}`,
  );
};

export const showSellStars = async (ctx) => {
  await ctx.answerCbQuery();
  const text = `💰 <b>Stars sotish</b>\n\nNarx: <b>1 Stars = ${STARS_PRICES.SELL_RATE.toLocaleString('ru-RU')} so'm</b>\n\nMiqdorni tanlang 👇`;
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
  await notifyAdmins(ctx.telegram,
    `💰 <b>Stars sotish</b>\n\n👤 ${displayName(user)} (<code>${user.telegramId}</code>)\n⭐ ${amount} Stars\n💰 ${formatMoney(totalPrice)}`,
  );
};


