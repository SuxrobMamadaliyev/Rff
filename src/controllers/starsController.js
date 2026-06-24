// -----------------------------------------------------------------------------
// Stars sotib olish va sotish controller'i.
// Sotib olish: foydalanuvchi so'm to'lab, Stars oladi (admin yuboradi).
// Sotish:      foydalanuvchi Stars yuborib, so'm oladi (admin to'laydi).
// -----------------------------------------------------------------------------
import { buyStarsKeyboard, sellStarsKeyboard, confirmStarsKeyboard, mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { notifyAdmins } from '../services/notifyService.js';
import { isAdmin } from '../config/index.js';
import { ACTIONS, STARS_PRICES, SCENES } from '../utils/constants.js';
import { formatMoney, escapeHtml, displayName } from '../utils/helpers.js';
import messages from '../utils/messages.js';

// ─── Stars SOTIB OLISH ────────────────────────────────────────────────────────

/**
 * "⭐ Stars sotib olish" tugmasi bosilganda — miqdor tanlash.
 */
export const showBuyStars = async (ctx) => {
  const text =
    `⭐ <b>Stars sotib olish</b>\n\n` +
    `Narx: <b>1 Stars = ${STARS_PRICES.BUY_RATE.toLocaleString('ru-RU')} so'm</b>\n\n` +
    `Miqdorni tanlang yoki o'zingiz kiriting 👇`;

  return ctx.reply(text, { parse_mode: 'HTML', ...buyStarsKeyboard() });
};

/**
 * Miqdor tugmasi bosilganda tasdiqlash ekrani.
 * Callback: stars_buy:<amount>
 */
export const handleBuyStarsAmount = async (ctx) => {
  await ctx.answerCbQuery();
  const amount = parseInt(ctx.match[1], 10);
  if (!amount || amount <= 0) return ctx.answerCbQuery('Xato miqdor', { show_alert: true });

  const totalPrice = amount * STARS_PRICES.BUY_RATE;

  const text =
    `⭐ <b>Stars sotib olish — tasdiqlash</b>\n\n` +
    `Miqdor: <b>${amount} ⭐</b>\n` +
    `Narx: <b>${formatMoney(totalPrice)}</b>\n\n` +
    `To'lovni amalga oshirgach admin tasdiqlaydi va Stars yuboriladi.\n` +
    `Davom etasizmi?`;

  return ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...confirmStarsKeyboard('buy', amount),
  });
};

/**
 * Boshqa miqdor — scene'ga kirish.
 * Callback: stars_buy_custom
 */
export const handleBuyStarsCustom = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.STARS_BUY);
};

/**
 * Tasdiqlash — adminga xabar yuborish.
 * Callback: stars_confirm:buy:<amount>
 */
export const confirmBuyStars = async (ctx) => {
  await ctx.answerCbQuery('✅ So\'rov yuborildi');
  const amount = parseInt(ctx.match[2], 10);
  const totalPrice = amount * STARS_PRICES.BUY_RATE;
  const user = ctx.state.user;

  await ctx.editMessageText(
    `✅ <b>So'rovingiz qabul qilindi!</b>\n\n` +
    `⭐ Miqdor: <b>${amount} Stars</b>\n` +
    `💰 To'lov summasi: <b>${formatMoney(totalPrice)}</b>\n\n` +
    `To'lovni quyidagi karta raqamiga o'tkazing va admin bilan bog'laning.`,
    { parse_mode: 'HTML' },
  );

  await notifyAdmins(
    ctx.telegram,
    `⭐ <b>Stars sotib olish so'rovi</b>\n\n` +
    `👤 ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
    `⭐ Miqdor: <b>${amount} Stars</b>\n` +
    `💰 Summa: <b>${formatMoney(totalPrice)}</b>\n` +
    `📊 Narx: ${STARS_PRICES.BUY_RATE} so'm/Stars`,
  );
};

// ─── Stars SOTISH ─────────────────────────────────────────────────────────────

/**
 * "💰 Stars sotish" tugmasi bosilganda — miqdor tanlash.
 */
export const showSellStars = async (ctx) => {
  const text =
    `💰 <b>Stars sotish</b>\n\n` +
    `Narx: <b>1 Stars = ${STARS_PRICES.SELL_RATE.toLocaleString('ru-RU')} so'm</b>\n\n` +
    `⚠️ Stars yuborishdan oldin miqdorni tasdiqlang!\n\n` +
    `Miqdorni tanlang 👇`;

  return ctx.reply(text, { parse_mode: 'HTML', ...sellStarsKeyboard() });
};

/**
 * Miqdor tugmasi bosilganda tasdiqlash ekrani.
 * Callback: stars_sell:<amount>
 */
export const handleSellStarsAmount = async (ctx) => {
  await ctx.answerCbQuery();
  const amount = parseInt(ctx.match[1], 10);
  if (!amount || amount <= 0) return ctx.answerCbQuery('Xato miqdor', { show_alert: true });

  const totalPrice = amount * STARS_PRICES.SELL_RATE;

  const text =
    `💰 <b>Stars sotish — tasdiqlash</b>\n\n` +
    `Miqdor: <b>${amount} ⭐</b>\n` +
    `Olasiz: <b>${formatMoney(totalPrice)}</b>\n\n` +
    `Tasdiqlashdan so'ng admin Stars qabul qilish uchun murojaat qiladi.\n` +
    `Davom etasizmi?`;

  return ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...confirmStarsKeyboard('sell', amount),
  });
};

/**
 * Boshqa miqdor — scene'ga kirish.
 */
export const handleSellStarsCustom = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.STARS_SELL);
};

/**
 * Tasdiqlash — adminga xabar yuborish.
 * Callback: stars_confirm:sell:<amount>
 */
export const confirmSellStars = async (ctx) => {
  await ctx.answerCbQuery('✅ So\'rov yuborildi');
  const amount = parseInt(ctx.match[2], 10);
  const totalPrice = amount * STARS_PRICES.SELL_RATE;
  const user = ctx.state.user;

  await ctx.editMessageText(
    `✅ <b>So'rovingiz qabul qilindi!</b>\n\n` +
    `⭐ Miqdor: <b>${amount} Stars</b>\n` +
    `💰 Olasiz: <b>${formatMoney(totalPrice)}</b>\n\n` +
    `Admin siz bilan bog'lanib Stars qabul qilish tartibini tushuntiradi.`,
    { parse_mode: 'HTML' },
  );

  await notifyAdmins(
    ctx.telegram,
    `💰 <b>Stars sotish so'rovi</b>\n\n` +
    `👤 ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
    `⭐ Miqdor: <b>${amount} Stars</b>\n` +
    `💰 To'lash kerak: <b>${formatMoney(totalPrice)}</b>\n` +
    `📊 Narx: ${STARS_PRICES.SELL_RATE} so'm/Stars`,
  );
};
