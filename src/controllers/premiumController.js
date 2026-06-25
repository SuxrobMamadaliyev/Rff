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

export const handlePaymentMethod = async (ctx) => {
  const planKey = ctx.match[1];
  const method = ctx.match[2];
  const isConfirm = ctx.match[3] === 'confirm';
  const plan = findPlan(planKey);

  if (!plan) {
    await ctx.answerCbQuery('Tarif topilmadi', { show_alert: true });
    return undefined;
  }

  if (method === PAYMENT_METHODS.BALANCE) {
    return handleBalancePurchase(ctx, plan);
  }

  if (!isConfirm) {
    await ctx.answerCbQuery();
    return ctx.editMessageText(messages.paymentInstructions(plan, method), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...confirmPaymentKeyboard(planKey, method),
    });
  }

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

const handleBalancePurchase = async (ctx, plan) => {
  const user = ctx.state.user;
  if (user.balance < plan.price) {
    await ctx.answerCbQuery('❌ Balans yetarli emas', { show_alert: true });
    return undefined;
  }
  try {
    const order = await purchaseFromBalance(ctx.from.id, plan);
    await completeOrder(order._id.toString(), 0);
    await ctx.answerCbQuery('✅ Sotib olindi');
    await ctx.editMessageText(messages.orderPaidFromBalance(plan), { parse_mode: 'HTML' });
    await notifyAdmins(
      ctx.telegram,
      `✅ <b>Balansdan to'lov</b>\n\n${messages.adminNewOrder(user, plan, PAYMENT_METHOD_LABELS[PAYMENT_METHODS.BALANCE])}`,
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
  const [, planKey] = (payment?.invoice_payload || '').split(':');
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

