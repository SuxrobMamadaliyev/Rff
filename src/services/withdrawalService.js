// -----------------------------------------------------------------------------
// Withdrawal business logic.
// -----------------------------------------------------------------------------
import { Withdrawal } from '../models/index.js';
import { adjustBalance } from './userService.js';
import { WITHDRAWAL_STATUS, TRANSACTION_TYPE } from '../utils/constants.js';

/**
 * Create a pending withdrawal request.
 * @param {number} telegramId
 * @param {string} cardNumber
 * @param {number} amount
 * @returns {Promise<import('mongoose').Document>}
 */
export const createWithdrawal = (telegramId, cardNumber, amount) =>
  Withdrawal.create({
    telegramId,
    cardNumber,
    amount,
    status: WITHDRAWAL_STATUS.PENDING,
  });

/**
 * Approve a withdrawal: debit the user's balance and mark it approved.
 * @param {string} withdrawalId
 * @param {number} adminId
 * @returns {Promise<{ withdrawal: import('mongoose').Document|null, ok: boolean, reason?: string }>}
 */
export const approveWithdrawal = async (withdrawalId, adminId) => {
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) return { withdrawal: null, ok: false, reason: 'NOT_FOUND' };
  if (withdrawal.status !== WITHDRAWAL_STATUS.PENDING) {
    return { withdrawal, ok: false, reason: 'ALREADY_HANDLED' };
  }

  try {
    await adjustBalance(withdrawal.telegramId, -withdrawal.amount, TRANSACTION_TYPE.WITHDRAWAL, {
      description: `Pul yechish: ${withdrawal.cardNumber}`,
      refId: withdrawal._id,
    });
  } catch (err) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      return { withdrawal, ok: false, reason: 'INSUFFICIENT_BALANCE' };
    }
    throw err;
  }

  withdrawal.status = WITHDRAWAL_STATUS.APPROVED;
  withdrawal.handledBy = adminId;
  withdrawal.handledAt = new Date();
  await withdrawal.save();

  return { withdrawal, ok: true };
};

/**
 * Reject a withdrawal request (no balance change).
 * @param {string} withdrawalId
 * @param {number} adminId
 * @returns {Promise<import('mongoose').Document|null>}
 */
export const rejectWithdrawal = async (withdrawalId, adminId) => {
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal || withdrawal.status !== WITHDRAWAL_STATUS.PENDING) return withdrawal;

  withdrawal.status = WITHDRAWAL_STATUS.REJECTED;
  withdrawal.handledBy = adminId;
  withdrawal.handledAt = new Date();
  await withdrawal.save();
  return withdrawal;
};
