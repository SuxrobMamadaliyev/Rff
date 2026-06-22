// -----------------------------------------------------------------------------
// Aggregated statistics for the admin dashboard.
// -----------------------------------------------------------------------------
import { User, Order, Payment, Withdrawal } from '../models/index.js';
import { ORDER_STATUS } from '../utils/constants.js';

/**
 * Build the statistics summary shown in the admin panel.
 * @returns {Promise<object>}
 */
export const getStatistics = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    todayUsers,
    bannedUsers,
    referredUsers,
    completedOrders,
    pendingOrders,
    pendingWithdrawals,
    paymentAgg,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ referredBy: { $ne: null } }),
    Order.countDocuments({ status: ORDER_STATUS.COMPLETED }),
    Order.countDocuments({ status: ORDER_STATUS.PENDING }),
    Withdrawal.countDocuments({ status: 'pending' }),
    Payment.aggregate([
      { $match: { type: 'purchase', direction: 'credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    totalUsers,
    todayUsers,
    bannedUsers,
    referredUsers,
    completedOrders,
    pendingOrders,
    pendingWithdrawals,
    totalRevenue: paymentAgg[0]?.total || 0,
  };
};

export default getStatistics;
