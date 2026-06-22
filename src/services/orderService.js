// -----------------------------------------------------------------------------
// Order & payment business logic.
// -----------------------------------------------------------------------------
import { Order, Payment } from '../models/index.js';
import { adjustBalance } from './userService.js';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  TRANSACTION_TYPE,
  PAYMENT_METHODS,
} from '../utils/constants.js';

/**
 * Create a pending order for a plan + payment method.
 * @param {number} telegramId
 * @param {object} plan - a config plan object
 * @param {string} method - PAYMENT_METHODS value
 * @returns {Promise<import('mongoose').Document>}
 */
export const createOrder = (telegramId, plan, method) =>
  Order.create({
    telegramId,
    planKey: plan.key,
    planTitle: plan.title,
    months: plan.months,
    amount: plan.price,
    method,
    status: ORDER_STATUS.PENDING,
  });

/**
 * Pay for a plan straight from the user's balance. Creates a paid order and
 * debits the balance atomically (throws INSUFFICIENT_BALANCE when too low).
 * @param {number} telegramId
 * @param {object} plan
 * @returns {Promise<import('mongoose').Document>} the order
 */
export const purchaseFromBalance = async (telegramId, plan) => {
  // adjustBalance throws if the balance is insufficient (validated first).
  const order = await Order.create({
    telegramId,
    planKey: plan.key,
    planTitle: plan.title,
    months: plan.months,
    amount: plan.price,
    method: PAYMENT_METHODS.BALANCE,
    status: ORDER_STATUS.PAID,
  });

  await adjustBalance(telegramId, -plan.price, TRANSACTION_TYPE.PURCHASE, {
    method: PAYMENT_METHODS.BALANCE,
    description: `Xarid: ${plan.title}`,
    refId: order._id,
  });

  return order;
};

/**
 * Record a confirmed payment for an order (used for Stars and manual confirms).
 * @param {import('mongoose').Document} order
 * @param {string} method
 * @returns {Promise<import('mongoose').Document>}
 */
export const recordPayment = (order, method) =>
  Payment.create({
    telegramId: order.telegramId,
    amount: order.amount,
    direction: 'credit',
    type: TRANSACTION_TYPE.PURCHASE,
    method,
    status: PAYMENT_STATUS.CONFIRMED,
    description: `To'lov: ${order.planTitle}`,
    refId: order._id,
  });

/**
 * Mark an order as completed by an admin and bump the user's purchase counter.
 * @param {string} orderId
 * @param {number} adminId
 * @returns {Promise<import('mongoose').Document|null>}
 */
export const completeOrder = async (orderId, adminId) => {
  const order = await Order.findById(orderId);
  if (!order || order.status === ORDER_STATUS.COMPLETED) return order;

  order.status = ORDER_STATUS.COMPLETED;
  order.handledBy = adminId;
  order.handledAt = new Date();
  await order.save();

  const { User } = await import('../models/index.js');
  await User.updateOne({ telegramId: order.telegramId }, { $inc: { purchasedCount: 1 } });

  return order;
};

/**
 * Mark an order as rejected.
 * @param {string} orderId
 * @param {number} adminId
 * @returns {Promise<import('mongoose').Document|null>}
 */
export const rejectOrder = async (orderId, adminId) => {
  const order = await Order.findById(orderId);
  if (!order || order.status === ORDER_STATUS.COMPLETED) return order;

  order.status = ORDER_STATUS.REJECTED;
  order.handledBy = adminId;
  order.handledAt = new Date();
  await order.save();
  return order;
};
