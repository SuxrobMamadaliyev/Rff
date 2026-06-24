// -----------------------------------------------------------------------------
// Premium purchase flow: plan listing, payment method selection, manual payment
// confirmation, Telegram Stars invoices and balance purchases.
// -----------------------------------------------------------------------------
import {
  plansKeyboard,
  paymentMethodsKeyboard,
  confirmPaymentKeyboard,
  mainMenuKeyboard,
} from '../keyboards/userKeyboards.js';
import { orderModerationKeyboard } from '../keyboards/adminKeyboards.js';
import {
  createOrder,
  purchaseFromBalance,
  recordPayment,
  completeOrder,
} from '../services/orderService.js';
import { notifyAdmins } from '../services/notifyService.js';
import { findPlan } from '../utils/helpers.js';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../utils/constants.js';
import { isAdmin } from '../config/index.js';
import messages from '../utils/messages.js';
import logger from '../utils/logger.js';

/**
 * Show the list of premium plans (text trigger + "back" callback).
 * @param {import('telegraf').Context} ctx
 */
export const showPlans = async (ctx) => {
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
    try {
      await ctx.editMessageText(messages.choosePlan, {
        parse_mode: 'HTML',
        ...plansKeyboard(),
      });
      return undefined;
    } catch (_err) {
      // Xabar tahrirlab bo'lmasa — yangi xabar yuboramiz
    }
  }
  return ctx.reply(messages.choosePlan, { parse_mode: 'HTML', ...plansKeyboard() });
};

/**
 * Show one plan's details + payment methods. Callback data: buy:<planKey>
 * @param {import('telegraf').Context} ctx
 */
export const showPlanDetails = async (ctx) => {
  const planKey = ctx.match[1];
  const plan = findPlan(planKey);
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
 * Handle a payment-method choice. Callback data:
 *   pay:<planKey>:<method>            -> show instructions / process balance
 *   pay:<planKey>:<method>:confirm    -> user confirms a manual transfer
 * @param {import('telegraf').Context} ctx
 */
export const handlePaymentMethod = async (ctx) => {
  const planKey = ctx.match[1];
  const method = ctx.match[2];
  const isConfirm = ctx.match[3] === 'confirm';
  const plan = findPlan(planKey);

  if (!plan) {
    await ctx.answerCbQuery('Tarif topilmadi', { show_alert: true });
    return undefined;
  }

  // ---- Balansdan to'lash ----
  if (method === PAYMENT_METHODS.BALANCE) {
    return handleBalancePurchase(ctx, plan);
  }

  // ---- Manual usullar (click / payme / uzum) — ko'rsatma ekrani ----
  if (!isConfirm) {
    await ctx.answerCbQuery();
    return ctx.editMessageText(messages.paymentInstructions(plan, method), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...confirmPaymentKeyboard(planKey, method),
    });
  }

  // ---- Foydalanuvchi «✅ To'lovni tasdiqlash» tugmasini bosdi ----
  await ctx.answerCbQuery('✅ Qabul qilindi');
  const order = await createOrder(ctx.from.id, plan, method);

  await ctx.editMessageText(messages.orderCreated(plan), { parse_mode: 'HTML' });

  // Adminga moderation keyboard bilan xabar
  await notifyAdmins(
    ctx.telegram,
    messages.adminNewOrder(ctx.state.user, plan, PAYMENT_METHOD_LABELS[method] || method),
    orderModerationKeyboard(order._id.toString()),
  );

  return undefined;
};

/**
 * Balansdan to'lash: muvaffaqiyatli bo'lsa buyurtmani avtomatik yakunlaydi.
 * FIX: purchaseFromBalance dan keyin completeOrder ham chaqiriladi —
 * chunki to'lov allaqachon yechilgan, admin kutish kerak emas.
 * @param {import('telegraf').Context} ctx
 * @param {object} plan
 */
const handleBalancePurchase = async (ctx, plan) => {
  const user = ctx.state.user;

  if (user.balance < plan.price) {
    await ctx.answerCbQuery('❌ Balans yetarli emas', { show_alert: true });
    return undefined;
  }

  try {
    const order = await purchaseFromBalance(ctx.from.id, plan);

    // Balansdan to'langan buyurtma darhol yakunlanadi
    await completeOrder(order._id.toString(), 0);

    await ctx.answerCbQuery('✅ Sotib olindi');
    await ctx.editMessageText(messages.orderPaidFromBalance(plan), {
      parse_mode: 'HTML',
    });

    // Adminga faqat ma'lumot uchun (moderation kerak emas)
    await notifyAdmins(
      ctx.telegram,
      `✅ <b>Balansdan to'lov</b>\n\n${messages.adminNewOrder(
        user,
        plan,
        PAYMENT_METHOD_LABELS[PAYMENT_METHODS.BALANCE],
      )}`,
    );
  } catch (err) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      await ctx.answerCbQuery('❌ Balans yetarli emas', { show_alert: true });
      return undefined;
    }
    logger.error(`Balance purchase error: ${err.message}`);
    throw err;
  }

  return undefined;
};

/**
 * Telegram Stars invoice yuborish. Callback data: stars:<planKey>
 * @param {import('telegraf').Context} ctx
 */
export const handleStarsInvoice = async (ctx) => {
  const planKey = ctx.match[1];
  const plan = findPlan(planKey);

  if (!plan || plan.stars <= 0) {
    await ctx.answerCbQuery('Bu tarif uchun Stars mavjud emas', { show_alert: true });
    return undefined;
  }

  await ctx.answerCbQuery();

  return ctx.replyWithInvoice({
    title: plan.title,
    description: plan.description,
    payload: `stars:${plan.key}`,
    provider_token: '', // Stars uchun bo'sh qoldiriladi
    currency: 'XTR',
    prices: [{ label: plan.title, amount: plan.stars }],
  });
};

/**
 * pre_checkout_query ga javob — Telegram to'lovni davom ettirishi uchun.
 * @param {import('telegraf').Context} ctx
 */
export const handlePreCheckout = (ctx) => ctx.answerPreCheckoutQuery(true);

/**
 * Muvaffaqiyatli Stars to'lovini yakunlash.
 * Stars to'lovi Telegram tomonidan tekshirilgani uchun — darhol COMPLETED.
 * @param {import('telegraf').Context} ctx
 */
export const handleSuccessfulPayment = async (ctx) => {
  const payment = ctx.message.successful_payment;
  const [, planKey] = (payment?.invoice_payload || '').split(':');
  const plan = findPlan(planKey);

  if (!plan) {
    logger.warn(`Unknown Stars invoice payload: ${payment?.invoice_payload}`);
    return ctx.reply('✅ To\'lov qabul qilindi. Tez orada aktivatsiya qilinadi.');
  }

  const order = await createOrder(ctx.from.id, plan, PAYMENT_METHODS.STARS);
  await recordPayment(order, PAYMENT_METHODS.STARS);
  // Stars to'lovi Telegram tomonidan kafolatlangan — admin confirm kerak emas
  await completeOrder(order._id.toString(), 0);

  await ctx.reply(messages.orderPaidFromBalance(plan), {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(isAdmin(ctx.from.id)),
  });

  await notifyAdmins(
    ctx.telegram,
    `⭐ <b>Stars to'lovi (avtomatik)</b>\n\n${messages.adminNewOrder(
      ctx.state.user,
      plan,
      'Telegram Stars',
    )}`,
  );

  return undefined;
};

