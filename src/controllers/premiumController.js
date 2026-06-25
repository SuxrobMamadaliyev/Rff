import {
  plansKeyboard,
  paymentMethodsKeyboard,
  cardSentKeyboard,
  mainMenuKeyboard,
} from '../keyboards/userKeyboards.js';
import { orderModerationKeyboard } from '../keyboards/adminKeyboards.js';
import {
  createOrder,
  recordPayment,
  completeOrder,
} from '../services/orderService.js';
import { notifyAdmins } from '../services/notifyService.js';
import { findPlan, escapeHtml, formatMoney, displayName } from '../utils/helpers.js';
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  SCENES,
  STARS_PRICES,
  TRANSACTION_TYPE,
  PAYMENT_STATUS,
} from '../utils/constants.js';
import Payment from '../models/Payment.js';
import { isAdmin } from '../config/index.js';
import config from '../config/index.js';
import messages from '../utils/messages.js';
import logger from '../utils/logger.js';

export const showPlans = async (ctx) => {
  await ctx.answerCbQuery();
  try {
    return await ctx.editMessageText(messages.choosePlan, {
      parse_mode: 'HTML',
      ...plansKeyboard(),
    });
  } catch (_err) {
    return ctx.reply(messages.choosePlan, { parse_mode: 'HTML', ...plansKeyboard() });
  }
};

export const showPlanDetails = async (ctx) => {
  const plan = findPlan(ctx.match[1]);
  if (!plan) {
    await ctx.answerCbQuery('Tarif topilmadi', { show_alert: true });
    return undefined;
  }
  await ctx.answerCbQuery();
  return ctx.editMessageText(messages.planDetails(plan), {
    parse_mode: 'HTML',
    ...paymentMethodsKeyboard(plan),
  });
};

/**
 * Admin kartasi tanlanganda karta ma'lumotlari ko'rsatiladi
 */
export const handleCardPayment = async (ctx) => {
  const planKey = ctx.match[1];
  const plan = findPlan(planKey);

  if (!plan) {
    await ctx.answerCbQuery('Tarif topilmadi', { show_alert: true });
    return undefined;
  }

  await ctx.answerCbQuery();

  const cardText =
    `💳 <b>Admin kartasi orqali to'lash</b>\n\n` +
    `⭐ Tarif: <b>${escapeHtml(plan.title)}</b>\n` +
    `💰 To'lov summasi: <b>${formatMoney(plan.price)}</b>\n\n` +
    `Quyidagi karta raqamiga o'tkazing:\n\n` +
    `💳 <code>${escapeHtml(config.payments.cardNumber)}</code>\n` +
    `👤 <b>${escapeHtml(config.payments.cardHolder)}</b>\n\n` +
    `To'lovni amalga oshirgach, <b>✅ Tashladim (chek yuborish)</b> tugmasini bosing.`;

  try {
    return await ctx.editMessageText(cardText, {
      parse_mode: 'HTML',
      ...cardSentKeyboard(planKey),
    });
  } catch (_err) {
    return ctx.reply(cardText, {
      parse_mode: 'HTML',
      ...cardSentKeyboard(planKey),
    });
  }
};

/**
 * Foydalanuvchi "Tashladim" tugmasini bosgach, chek (screenshot) so'raladi
 */
export const handleCardSentCheck = async (ctx) => {
  const planKey = ctx.match[1];
  const plan = findPlan(planKey);

  if (!plan) {
    await ctx.answerCbQuery('Tarif topilmadi', { show_alert: true });
    return undefined;
  }

  await ctx.answerCbQuery('✅ Chek yuborish...');

  // Scene'ga o'tamiz, planKey saqlanadi
  return ctx.scene.enter(SCENES.CARD_CHECK_SCENE, { planKey, plan });
};

export const handleStarsInvoice = async (ctx) => {
  const plan = findPlan(ctx.match[1]);
  if (!plan || plan.stars <= 0) {
    await ctx.answerCbQuery('Bu tarif uchun Stars mavjud emas', { show_alert: true });
    return undefined;
  }
  await ctx.answerCbQuery();
  return ctx.replyWithInvoice({
    title: plan.title,
    description: plan.description,
    payload: `stars:${plan.key}`,
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: plan.title, amount: plan.stars }],
  });
};

export const handlePreCheckout = (ctx) => ctx.answerPreCheckoutQuery(true);

export const handleSuccessfulPayment = async (ctx) => {
  const payment = ctx.message.successful_payment;
  const payload = payment?.invoice_payload || '';

  // ── Stars SOTISH to'lovi (foydalanuvchi Stars'ini botga o'tkazdi) ─────────
  if (payload.startsWith('sell_stars:')) {
    const [, amountStr] = payload.split(':');
    const amount = parseInt(amountStr, 10) || payment.total_amount;
    const totalPrice = amount * STARS_PRICES.SELL_RATE;
    const user = ctx.state.user;

    await Payment.create({
      telegramId: ctx.from.id,
      amount: totalPrice,
      direction: 'debit',
      type: TRANSACTION_TYPE.STARS_SELL,
      method: PAYMENT_METHODS.STARS,
      status: PAYMENT_STATUS.CONFIRMED,
      description: `Stars sotish: ${amount} ⭐`,
    });

    await ctx.reply(
      `✅ <b>Stars qabul qilindi!</b>\n\n` +
      `⭐ Miqdor: <b>${amount} Stars</b>\n` +
      `💰 Sizga to'lanadi: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `Admin tez orada to'lovingizni yuboradi. 🙏`,
      { parse_mode: 'HTML', ...mainMenuKeyboard(isAdmin(ctx.from.id)) },
    );

    await notifyAdmins(
      ctx.telegram,
      `💰 <b>Stars sotildi (to'lov qabul qilindi)</b>\n\n` +
      `👤 Foydalanuvchi: ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
      `⭐ Miqdor: <b>${amount} Stars</b>\n` +
      `💰 Foydalanuvchiga to'lanishi kerak: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `✅ Stars botga muvaffaqiyatli o'tkazildi. Foydalanuvchiga pulni o'tkazib, tasdiqlang.`,
    );
    return undefined;
  }

  // ── Premium reja to'lovi (mavjud oqim) ─────────────────────────────────────
  const [, planKey] = payload.split(':');
  const plan = findPlan(planKey);
  if (!plan) {
    return ctx.reply("✅ To'lov qabul qilindi. Tez orada aktivatsiya qilinadi.");
  }
  const order = await createOrder(ctx.from.id, plan, PAYMENT_METHODS.STARS);
  await recordPayment(order, PAYMENT_METHODS.STARS);
  await completeOrder(order._id.toString(), 0);
  await ctx.reply(messages.orderPaidFromBalance(plan), {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(isAdmin(ctx.from.id)),
  });
  await notifyAdmins(
    ctx.telegram,
    `⭐ <b>Stars to'lovi (avtomatik)</b>\n\n${messages.adminNewOrder(ctx.state.user, plan, 'Telegram Stars')}`,
  );
  return undefined;
};





