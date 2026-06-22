// -----------------------------------------------------------------------------
// Admin statistics dashboard.
// -----------------------------------------------------------------------------
import { getStatistics } from '../../services/statsService.js';
import { formatMoney } from '../../utils/helpers.js';

/**
 * Render the statistics summary.
 * @param {import('telegraf').Context} ctx
 */
export const showStatistics = async (ctx) => {
  const s = await getStatistics();
  const text =
    `📊 <b>Statistika</b>\n\n` +
    `👥 Jami foydalanuvchilar: <b>${s.totalUsers}</b>\n` +
    `🆕 Bugungi foydalanuvchilar: <b>${s.todayUsers}</b>\n` +
    `🔗 Referal orqali kelganlar: <b>${s.referredUsers}</b>\n` +
    `🚫 Banlanganlar: <b>${s.bannedUsers}</b>\n\n` +
    `⭐ Premium xaridlar: <b>${s.completedOrders}</b>\n` +
    `⏳ Kutilayotgan buyurtmalar: <b>${s.pendingOrders}</b>\n` +
    `💸 Kutilayotgan pul yechishlar: <b>${s.pendingWithdrawals}</b>\n\n` +
    `💰 Jami to'lovlar: <b>${formatMoney(s.totalRevenue)}</b>`;

  return ctx.reply(text, { parse_mode: 'HTML' });
};

export default showStatistics;
