// -----------------------------------------------------------------------------
// Admin: list recent users.
// -----------------------------------------------------------------------------
import { User } from '../../models/index.js';
import { formatMoney, formatDate, displayName } from '../../utils/helpers.js';

/**
 * Show the 15 most recent users with key metrics.
 * @param {import('telegraf').Context} ctx
 */
export const listUsers = async (ctx) => {
  const users = await User.find({}).sort({ createdAt: -1 }).limit(15);
  if (users.length === 0) {
    return ctx.reply('👥 Foydalanuvchilar mavjud emas.');
  }

  const lines = users.map((u, i) => {
    const flags = `${u.isBanned ? '🚫' : ''}${u.isAdmin ? '👑' : ''}`.trim();
    return (
      `${i + 1}. ${displayName(u)} ${flags}\n` +
      `   🆔 <code>${u.telegramId}</code> | 💰 ${formatMoney(u.balance)}\n` +
      `   👥 ${u.referralCount} ref | ⭐ ${u.purchasedCount} xarid | 🗓 ${formatDate(u.createdAt)}`
    );
  });

  const total = await User.countDocuments({});
  return ctx.reply(
    `👥 <b>Foydalanuvchilar</b> (oxirgi 15 / jami ${total})\n\n${lines.join('\n\n')}`,
    { parse_mode: 'HTML' },
  );
};

export default listUsers;
