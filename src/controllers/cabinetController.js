// -----------------------------------------------------------------------------
// Personal cabinet: balance overview + purchase/payment/withdrawal history.
// -----------------------------------------------------------------------------
import { Order, Payment, Withdrawal } from '../models/index.js';
import { cabinetKeyboard } from '../keyboards/userKeyboards.js';
import { formatMoney, formatDate } from '../utils/helpers.js';
import {
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS,
  WITHDRAWAL_STATUS,
} from '../utils/constants.js';
import messages from '../utils/messages.js';

const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: '⏳ Kutilmoqda',
  [ORDER_STATUS.PAID]: '💳 To\'langan',
  [ORDER_STATUS.COMPLETED]: '✅ Bajarildi',
  [ORDER_STATUS.REJECTED]: '❌ Rad etildi',
};

const WITHDRAWAL_STATUS_LABEL = {
  [WITHDRAWAL_STATUS.PENDING]: '⏳ Kutilmoqda',
  [WITHDRAWAL_STATUS.APPROVED]: '✅ Tasdiqlandi',
  [WITHDRAWAL_STATUS.REJECTED]: '❌ Rad etildi',
};

/**
 * Show the cabinet overview.
 * @param {import('telegraf').Context} ctx
 */
export const showCabinet = (ctx) =>
  ctx.reply(messages.cabinet(ctx.state.user), {
    parse_mode: 'HTML',
    ...cabinetKeyboard(),
  });

/**
 * Show the user's last purchases.
 * @param {import('telegraf').Context} ctx
 */
export const showOrderHistory = async (ctx) => {
  await ctx.answerCbQuery();
  const orders = await Order.find({ telegramId: ctx.from.id }).sort({ createdAt: -1 }).limit(10);

  if (orders.length === 0) {
    return ctx.reply(messages.noPurchases, { parse_mode: 'HTML' });
  }

  const lines = orders.map(
    (o) =>
      `⭐ <b>${o.planTitle}</b>\n` +
      `   💰 ${formatMoney(o.amount)} | ${ORDER_STATUS_LABEL[o.status] || o.status}\n` +
      `   🗓 ${formatDate(o.createdAt)}`,
  );

  return ctx.reply(`📦 <b>Xaridlar tarixi</b>\n\n${lines.join('\n\n')}`, { parse_mode: 'HTML' });
};

/**
 * Show the user's last balance movements / payments.
 * @param {import('telegraf').Context} ctx
 */
export const showPaymentHistory = async (ctx) => {
  await ctx.answerCbQuery();
  const payments = await Payment.find({ telegramId: ctx.from.id }).sort({ createdAt: -1 }).limit(10);

  if (payments.length === 0) {
    return ctx.reply(messages.noPayments, { parse_mode: 'HTML' });
  }

  const lines = payments.map((p) => {
    const sign = p.direction === 'credit' ? '➕' : '➖';
    const method = p.method ? ` (${PAYMENT_METHOD_LABELS[p.method] || p.method})` : '';
    return `${sign} <b>${formatMoney(p.amount)}</b>${method}\n   ${p.description || p.type}\n   🗓 ${formatDate(p.createdAt)}`;
  });

  return ctx.reply(`💳 <b>To'lovlar tarixi</b>\n\n${lines.join('\n\n')}`, { parse_mode: 'HTML' });
};

/**
 * Show the user's withdrawal requests.
 * @param {import('telegraf').Context} ctx
 */
export const showWithdrawalHistory = async (ctx) => {
  await ctx.answerCbQuery();
  const withdrawals = await Withdrawal.find({ telegramId: ctx.from.id })
    .sort({ createdAt: -1 })
    .limit(10);

  if (withdrawals.length === 0) {
    return ctx.reply(messages.noWithdrawals, { parse_mode: 'HTML' });
  }

  const lines = withdrawals.map(
    (w) =>
      `💸 <b>${formatMoney(w.amount)}</b> | ${WITHDRAWAL_STATUS_LABEL[w.status] || w.status}\n` +
      `   💳 ${w.cardNumber}\n   🗓 ${formatDate(w.createdAt)}`,
  );

  return ctx.reply(`💸 <b>Pul yechishlar</b>\n\n${lines.join('\n\n')}`, { parse_mode: 'HTML' });
};
