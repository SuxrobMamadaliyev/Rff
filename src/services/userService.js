// -----------------------------------------------------------------------------
// User related business logic: registration, balance mutations, referrals.
// Controllers call into these functions so DB rules live in one place.
// -----------------------------------------------------------------------------
import { User, Payment, Referral, Settings } from '../models/index.js';
import config, { isAdmin } from '../config/index.js';
import { TRANSACTION_TYPE } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Find a user by Telegram id.
 * @param {number} telegramId
 * @returns {Promise<import('mongoose').Document|null>}
 */
export const getUser = (telegramId) => User.findOne({ telegramId });

/**
 * Register a user on first contact, or refresh their profile fields.
 * Handles attaching a referrer (only on first creation).
 *
 * @param {object} from - Telegram `ctx.from`
 * @param {number|null} referrerId - parsed from /start payload (may be null)
 * @returns {Promise<{ user: import('mongoose').Document, isNew: boolean }>}
 */
export const registerUser = async (from, referrerId = null) => {
  let user = await User.findOne({ telegramId: from.id });

  if (user) {
    // Refresh mutable profile fields on every interaction.
    user.username = from.username || user.username;
    user.firstName = from.first_name || user.firstName;
    user.lastName = from.last_name || user.lastName;
    user.languageCode = from.language_code || user.languageCode;
    user.lastActiveAt = new Date();
    user.isAdmin = isAdmin(from.id);
    await user.save();
    return { user, isNew: false };
  }

  // Validate the referrer: must exist, must not be self.
  let validReferrer = null;
  if (referrerId && referrerId !== from.id) {
    validReferrer = await User.findOne({ telegramId: referrerId });
  }

  user = await User.create({
    telegramId: from.id,
    username: from.username || null,
    firstName: from.first_name || null,
    lastName: from.last_name || null,
    languageCode: from.language_code || 'uz',
    isAdmin: isAdmin(from.id),
    referredBy: validReferrer ? validReferrer.telegramId : null,
  });

  if (validReferrer) {
    await rewardReferrer(validReferrer, user);
  }

  return { user, isNew: true };
};

/**
 * Credit a referrer for a newly joined referred user (idempotent).
 * @param {import('mongoose').Document} referrer
 * @param {import('mongoose').Document} referred
 */
export const rewardReferrer = async (referrer, referred) => {
  const exists = await Referral.findOne({ referredId: referred.telegramId });
  if (exists) return; // already rewarded

  const settings = await Settings.getSettings();
  const bonus = settings.referralBonus ?? config.economy.referralBonus;

  await Referral.create({
    referrerId: referrer.telegramId,
    referredId: referred.telegramId,
    bonus,
  });

  referrer.balance += bonus;
  referrer.referralCount += 1;
  referrer.referralEarnings += bonus;
  await referrer.save();

  await Payment.create({
    telegramId: referrer.telegramId,
    amount: bonus,
    direction: 'credit',
    type: TRANSACTION_TYPE.REFERRAL_BONUS,
    description: `Referal bonus: ${referred.telegramId}`,
  });

  logger.info(`Referral bonus ${bonus} -> ${referrer.telegramId} for ${referred.telegramId}`);
};

/**
 * Adjust a user's balance and write a ledger entry. Negative `amount` debits.
 * Throws when a debit would make the balance negative.
 *
 * @param {number} telegramId
 * @param {number} amount - positive credit / negative debit
 * @param {string} type - TRANSACTION_TYPE value
 * @param {object} [opts]
 * @param {string} [opts.description]
 * @param {string} [opts.method]
 * @param {import('mongoose').Types.ObjectId} [opts.refId]
 * @returns {Promise<import('mongoose').Document>} updated user
 */
export const adjustBalance = async (telegramId, amount, type, opts = {}) => {
  const user = await User.findOne({ telegramId });
  if (!user) throw new Error(`User ${telegramId} not found`);

  if (amount < 0 && user.balance + amount < 0) {
    throw new Error('INSUFFICIENT_BALANCE');
  }

  user.balance += amount;
  await user.save();

  await Payment.create({
    telegramId,
    amount: Math.abs(amount),
    direction: amount >= 0 ? 'credit' : 'debit',
    type,
    method: opts.method || null,
    description: opts.description || '',
    refId: opts.refId || null,
  });

  return user;
};

/**
 * Set the banned flag for a user.
 * @param {number} telegramId
 * @param {boolean} banned
 * @returns {Promise<import('mongoose').Document|null>}
 */
export const setBanned = (telegramId, banned) =>
  User.findOneAndUpdate({ telegramId }, { isBanned: banned }, { new: true });

/**
 * Mark the user's subscription state (cache of the channel membership check).
 * @param {number} telegramId
 * @param {boolean} subscribed
 */
export const setSubscribed = (telegramId, subscribed) =>
  User.findOneAndUpdate({ telegramId }, { isSubscribed: subscribed }, { new: true });
