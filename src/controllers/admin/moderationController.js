// -----------------------------------------------------------------------------
// Admin moderation callbacks: confirm/reject orders & withdrawals, ticket reply
// and close. These are triggered from inline buttons on admin notifications.
// -----------------------------------------------------------------------------
import { completeOrder, rejectOrder, recordPayment } from '../../services/orderService.js';
import { Order } from '../../models/index.js';
import { approveWithdrawal, rejectWithdrawal } from '../../services/withdrawalService.js';
import { closeTicket } from '../../services/ticketService.js';
import { notifyUser } from '../../services/notifyService.js';
import { formatMoney } from '../../utils/helpers.js';
import { SCENES, ORDER_STATUS } from '../../utils/constants.js';

/**
 * Append a status line to the admin's original notification message.
 * @param {import('telegraf').Context} ctx
 * @param {string} status
 */
const stampMessage = async (ctx, status) => {
  try {
    const original = ctx.callbackQuery.message?.text || '';
    await ctx.editMessageText(`${original}\n\n${status}`, { parse_mode: 'HTML' });
  } catch (_err) {
    // message may be uneditable; ignore
  }
};

// ---- Orders ----

/**
 * Confirm an order. Records the payment (for manual methods) and completes it.
 * @param {import('telegraf').Context} ctx
 */
export const confirmOrder = async (ctx) => {
  const orderId = ctx.match[1];
  const order = await Order.findById(orderId);

  if (!order) {
    await ctx.answerCbQuery('Buyurtma topilmadi', { show_alert: true });
    return undefined;
  }
  if (order.status === ORDER_STATUS.COMPLETED) {
    await ctx.answerCbQuery('Allaqachon tasdiqlangan');
    return undefined;
  }

  await recordPayment(order, order.method);
  await completeOrder(orderId, ctx.from.id);

  await ctx.answerCbQuery('✅ Tasdiqlandi');
  await stampMessage(ctx, `✅ <b>Tasdiqlandi</b> (admin: ${ctx.from.id})`);

  await notifyUser(
    ctx.telegram,
    order.telegramId,
    `✅ <b>${order.planTitle}</b> buyurtmangiz tasdiqlandi!\n\nTez orada Premium faollashtiriladi. Rahmat! 🙏`,
  );
  return undefined;
};

/**
 * Reject an order.
 * @param {import('telegraf').Context} ctx
 */
export const declineOrder = async (ctx) => {
  const orderId = ctx.match[1];
  const order = await rejectOrder(orderId, ctx.from.id);

  if (!order) {
    await ctx.answerCbQuery('Buyurtma topilmadi', { show_alert: true });
    return undefined;
  }

  await ctx.answerCbQuery('❌ Rad etildi');
  await stampMessage(ctx, `❌ <b>Rad etildi</b> (admin: ${ctx.from.id})`);

  // FIX: order null emasligini tekshirgandan keyin notifyUser chaqiriladi
  await notifyUser(
    ctx.telegram,
    order.telegramId,
    `❌ <b>${order.planTitle}</b> buyurtmangiz rad etildi.\n\nSavollar bo'lsa admin bilan bog'laning.`,
  );
  return undefined;
};

// ---- Withdrawals ----

/**
 * Approve a withdrawal (debits the user's balance).
 * @param {import('telegraf').Context} ctx
 */
export const confirmWithdrawal = async (ctx) => {
  const id = ctx.match[1];
  const { withdrawal, ok, reason } = await approveWithdrawal(id, ctx.from.id);

  if (!withdrawal) {
    await ctx.answerCbQuery('So\'rov topilmadi', { show_alert: true });
    return undefined;
  }
  if (!ok && reason === 'ALREADY_HANDLED') {
    await ctx.answerCbQuery('Allaqachon ko\'rib chiqilgan');
    return undefined;
  }
  if (!ok && reason === 'INSUFFICIENT_BALANCE') {
    await ctx.answerCbQuery('❌ Foydalanuvchi balansi yetarli emas', { show_alert: true });
    return undefined;
  }
  if (!ok) {
    await ctx.answerCbQuery('Xatolik yuz berdi', { show_alert: true });
    return undefined;
  }

  await ctx.answerCbQuery('✅ Tasdiqlandi');
  await stampMessage(ctx, `✅ <b>To'landi</b> (admin: ${ctx.from.id})`);

  await notifyUser(
    ctx.telegram,
    withdrawal.telegramId,
    `✅ <b>${formatMoney(withdrawal.amount)}</b> kartangizga (<code>${withdrawal.cardNumber}</code>) o'tkazildi.`,
  );
  return undefined;
};

/**
 * Reject a withdrawal request.
 * @param {import('telegraf').Context} ctx
 */
export const declineWithdrawal = async (ctx) => {
  const id = ctx.match[1];
  const withdrawal = await rejectWithdrawal(id, ctx.from.id);

  if (!withdrawal) {
    await ctx.answerCbQuery('So\'rov topilmadi', { show_alert: true });
    return undefined;
  }

  await ctx.answerCbQuery('❌ Rad etildi');
  await stampMessage(ctx, `❌ <b>Rad etildi</b> (admin: ${ctx.from.id})`);

  await notifyUser(
    ctx.telegram,
    withdrawal.telegramId,
    `❌ Pul yechish so'rovingiz (${formatMoney(withdrawal.amount)}) rad etildi. Balansingiz o'zgarmadi.`,
  );
  return undefined;
};

// ---- Tickets ----

/**
 * Enter the reply scene for a ticket (ticketId carried via scene state).
 * @param {import('telegraf').Context} ctx
 */
export const replyTicket = async (ctx) => {
  const ticketId = ctx.match[1];
  await ctx.answerCbQuery();
  return ctx.scene.enter(SCENES.ADMIN_REPLY_TICKET, { ticketId });
};

/**
 * Close a ticket.
 * @param {import('telegraf').Context} ctx
 */
export const closeTicketHandler = async (ctx) => {
  const ticketId = ctx.match[1];
  const ticket = await closeTicket(ticketId, ctx.from.id);

  if (!ticket) {
    await ctx.answerCbQuery('Ticket topilmadi', { show_alert: true });
    return undefined;
  }

  await ctx.answerCbQuery('🔒 Yopildi');
  await stampMessage(ctx, `🔒 <b>Yopildi</b> (admin: ${ctx.from.id})`);
  return undefined;
};

