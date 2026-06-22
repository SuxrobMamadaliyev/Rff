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
      // fall through to sending a fresh message
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

  // ---- Pay from balance ----
  if (method === PAYMENT_METHODS.BALANCE) {
    return handleBalancePurchase(ctx, plan);
  }

  // ---- Manual methods (click / payme / uzum) ----
  if (!isConfirm) {
    await ctx.answerCbQuery();
    return ctx.editMessageText(messages.paymentInstructions(plan, method), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...confirmPaymentKeyboard(planKey, method),
    });
  }

  // ---- User pressed "✅ To'lovni tasdiqlash" ----
  await ctx.answerCbQuery('✅ Qabul qilindi');
  const order = await createOrder(ctx.from.id, plan, method);

  await ctx.editMessageText(messages.orderCreated(plan), { parse_mode: 'HTML' });

  await notifyAdmins(
    ctx.telegram,
    messages.adminNewOrder(ctx.state.user, plan, PAYMENT_METHOD_LABELS[method] || method),
    orderModerationKeyboard(order._id.toString()),
  );

  return undefined;
};

/**
 * Process a purchase paid directly from the user's balance.
 * @param {import('telegraf').Context} ctx
 * @param {object} plan
 */
const handleBalancePurchase = async (ctx, plan) => {
  if (ctx.state.user.balance < plan.price) {
    await ctx.answerCbQuery('❌ Balans yetarli emas', { show_alert: true });
    return undefined;
  }

  try {
    const order = await purchaseFromBalance(ctx.from.id, plan);
    await ctx.answerCbQuery('✅ Sotib olindi');
    await ctx.editMessageText(messages.orderPaidFromBalance(plan), { parse_mode: 'HTML' });

    await notifyAdmins(
      ctx.telegram,
      messages.adminNewOrder(ctx.state.user, plan, PAYMENT_METHOD_LABELS[PAYMENT_METHODS.BALANCE]),
      orderModerationKeyboard(order._id.toString()),
    );
  } catch (err) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      await ctx.answerCbQuery('❌ Balans yetarli emas', { show_alert: true });
      return undefined;
    }
    throw err;
  }
  return undefined;
};

/**
 * Send a Telegram Stars invoice. Callback data: stars:<planKey>
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

  // Telegram Stars invoices use the "XTR" currency and an empty provider token.
  // The payload encodes the plan so we can finalize the order after payment.
  return ctx.replyWithInvoice({
    title: plan.title,
    description: plan.description,
    payload: `stars:${plan.key}`,
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: plan.title, amount: plan.stars }],
  });
};

/**
 * Answer the pre_checkout_query so Telegram proceeds with payment.
 * @param {import('telegraf').Context} ctx
 */
export const handlePreCheckout = (ctx) => ctx.answerPreCheckoutQuery(true);

/**
 * Finalize a successful Telegram Stars payment.
 * @param {import('telegraf').Context} ctx
 */
export const handleSuccessfulPayment = async (ctx) => {
  const payment = ctx.message.successful_payment;
  const [, planKey] = (payment?.invoice_payload || '').split(':');
  const plan = findPlan(planKey);

  if (!plan) {
    logger.warn(`Unknown invoice payload: ${payment?.invoice_payload}`);
    return ctx.reply('✅ To\'lov qabul qilindi.');
  }

  const order = await createOrder(ctx.from.id, plan, PAYMENT_METHODS.STARS);
  await recordPayment(order, PAYMENT_METHODS.STARS);
  // Stars payments are instant + verified by Telegram, so auto-complete.
  await completeOrder(order._id.toString(), 0);

  await ctx.reply(messages.orderPaidFromBalance(plan), {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(),
  });

  await notifyAdmins(
    ctx.telegram,
    `⭐ <b>Stars to'lovi</b>\n\n${messages.adminNewOrder(ctx.state.user, plan, 'Telegram Stars')}`,
  );

  return undefined;
};
