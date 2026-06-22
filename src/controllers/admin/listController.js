// -----------------------------------------------------------------------------
// Admin: payments and orders listings.
// -----------------------------------------------------------------------------
import { Order, Payment } from '../../models/index.js';
import { formatMoney, formatDate } from '../../utils/helpers.js';
import { PAYMENT_METHOD_LABELS } from '../../utils/constants.js';

/**
 * Show the latest payments ledger entries.
 * @param {import('telegraf').Context} ctx
 */
export const listPayments = async (ctx) => {
  const payments = await Payment.find({}).sort({ createdAt: -1 }).limit(15);
  if (payments.length === 0) {
    return ctx.reply('💳 To\'lovlar mavjud emas.');
  }

  const lines = payments.map((p) => {
    const sign = p.direction === 'credit' ? '➕' : '➖';
    const method = p.method ? ` (${PAYMENT_METHOD_LABELS[p.method] || p.method})` : '';
    return (
      `${sign} <b>${formatMoney(p.amount)}</b>${method}\n` +
      `   👤 <code>${p.telegramId}</code> | ${p.type}\n` +
      `   🗓 ${formatDate(p.createdAt)}`
    );
  });

  return ctx.reply(`📋 <b>To'lovlar</b> (oxirgi 15)\n\n${lines.join('\n\n')}`, { parse_mode: 'HTML' });
};

/**
 * Show the latest orders.
 * @param {import('telegraf').Context} ctx
 */
export const listOrders = async (ctx) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(15);
  if (orders.length === 0) {
    return ctx.reply('📦 Buyurtmalar mavjud emas.');
  }

  const lines = orders.map(
    (o) =>
      `⭐ <b>${o.planTitle}</b> — ${formatMoney(o.amount)}\n` +
      `   👤 <code>${o.telegramId}</code> | ${o.method} | ${o.status}\n` +
      `   🗓 ${formatDate(o.createdAt)}`,
  );

  return ctx.reply(`📦 <b>Buyurtmalar</b> (oxirgi 15)\n\n${lines.join('\n\n')}`, { parse_mode: 'HTML' });
};
