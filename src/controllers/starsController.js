import { buyStarsKeyboard, sellStarsKeyboard } from '../keyboards/userKeyboards.js';
import { STARS_PRICES, SCENES } from '../utils/constants.js';
import { formatMoney } from '../utils/helpers.js';

/**
 * Foydalanuvchiga Stars sotish uchun haqiqiy Telegram invoice yuboradi.
 * Foydalanuvchi shu invoyс orqali o'z Stars'ini botga (XTR) to'laydi.
 */
export const sendSellStarsInvoice = (ctx, amount) =>
  ctx.replyWithInvoice({
    title: `${amount} ⭐ Stars sotish`,
    description: `Siz ${amount} Stars sotmoqdasiz. To'lovni tasdiqlang — Stars botga o'tkaziladi, so'ng admin to'lovingizni yuboradi.`,
    payload: `sell_stars:${amount}`,
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: `${amount} Stars`, amount }],
  });

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

// Tugmadan miqdor tanlanganda — to'g'ridan-to'g'ri Stars invoyсi yuboriladi
export const handleSellStarsAmount = async (ctx) => {
  const amount = parseInt(ctx.match[1], 10);
  if (!amount || amount <= 0) {
    await ctx.answerCbQuery('Xato miqdor', { show_alert: true });
    return undefined;
  }
  await ctx.answerCbQuery();
  const totalPrice = amount * STARS_PRICES.SELL_RATE;
  await ctx.reply(
    `💰 <b>Stars sotish</b>\n\n⭐ Miqdor: <b>${amount} Stars</b>\n💰 Olasiz: <b>${formatMoney(totalPrice)}</b>\n\n` +
    `Quyidagi invoysni to'lab, Stars'ingizni botga o'tkazing 👇`,
    { parse_mode: 'HTML' },
  );
  return sendSellStarsInvoice(ctx, amount);
};

// "Boshqa miqdor" — scene'ga kiramiz, u yerda foydalanuvchi raqam kiritadi
export const handleSellStarsCustom = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.STARS_SELL);
};

// Eski tasdiqlash tugmasi — endi ishlatilmaydi, fallback sifatida invoys yuboradi
export const confirmSellStars = async (ctx) => {
  const amount = parseInt(ctx.match[2], 10);
  await ctx.answerCbQuery();
  if (!amount || amount <= 0) return undefined;
  return sendSellStarsInvoice(ctx, amount);
};
