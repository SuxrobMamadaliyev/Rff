// -----------------------------------------------------------------------------
// Admin: foydalanuvchilar ro'yxati va ma'lumotlari.
// -----------------------------------------------------------------------------
import { User } from '../../models/index.js';
import { formatMoney, formatDate, displayName } from '../../utils/helpers.js';
import { ACTIONS } from '../../utils/constants.js';
import { Markup } from 'telegraf';

/**
 * Foydalanuvchi kartochkasi uchun inline keyboard.
 * @param {number} telegramId
 */
const userCardKeyboard = (telegramId) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📋 Batafsil', `${ACTIONS.ADMIN_USER_INFO}:${telegramId}`)],
  ]);

/**
 * So'nggi ro'yxatga olingan foydalanuvchilarni ko'rsatish (oxirgi 20 ta).
 * @param {import('telegraf').Context} ctx
 */
export const listUsers = async (ctx) => {
  const users = await User.find({}).sort({ createdAt: -1 }).limit(20);

  if (users.length === 0) {
    return ctx.reply('👥 Foydalanuvchilar mavjud emas.');
  }

  const total = await User.countDocuments();
  const banned = await User.countDocuments({ isBanned: true });
  const premium = await User.countDocuments({ purchasedCount: { $gt: 0 } });

  const header =
    `👥 <b>Foydalanuvchilar</b>\n\n` +
    `📊 Jami: <b>${total}</b> | ` +
    `⭐ Premium: <b>${premium}</b> | ` +
    `🚫 Banlangan: <b>${banned}</b>\n\n` +
    `<i>Oxirgi 20 ta:</i>\n`;

  const lines = users.map((u, i) => {
    const name = displayName(u);
    const status = u.isBanned ? '🚫' : u.purchasedCount > 0 ? '⭐' : '👤';
    return (
      `${i + 1}. ${status} ${name}\n` +
      `   🆔 <code>${u.telegramId}</code> | 💰 ${formatMoney(u.balance)}\n` +
      `   🗓 ${formatDate(u.createdAt)}`
    );
  });

  return ctx.reply(`${header}${lines.join('\n\n')}`, { parse_mode: 'HTML' });
};

/**
 * Bitta foydalanuvchi haqida to'liq ma'lumot (inline callback orqali).
 * Action: `ACTIONS.ADMIN_USER_INFO:<telegramId>`
 * @param {import('telegraf').Context} ctx
 */
export const showUserInfo = async (ctx) => {
  await ctx.answerCbQuery();
  const telegramId = Number(ctx.match[1]);
  const user = await User.findOne({ telegramId });

  if (!user) {
    return ctx.reply('❌ Foydalanuvchi topilmadi.');
  }

  const name = displayName(user);
  const status = user.isBanned
    ? '🚫 Banlangan'
    : user.purchasedCount > 0
      ? '⭐ Premium xaridor'
      : '👤 Oddiy';

  const text =
    `👤 <b>Foydalanuvchi ma'lumoti</b>\n\n` +
    `🆔 ID: <code>${user.telegramId}</code>\n` +
    `👤 Ism: ${name}\n` +
    `📱 Username: ${user.username ? `@${user.username}` : '—'}\n` +
    `🏷 Status: ${status}\n\n` +
    `💰 Balans: <b>${formatMoney(user.balance)}</b>\n` +
    `👥 Referallar: <b>${user.referralCount}</b>\n` +
    `💵 Referal daromad: <b>${formatMoney(user.referralEarnings)}</b>\n` +
    `🛒 Xaridlar: <b>${user.purchasedCount}</b>\n\n` +
    `📅 Ro'yxatdan o'tgan: ${formatDate(user.createdAt)}\n` +
    `🕐 Oxirgi faollik: ${formatDate(user.lastActiveAt)}`;

  return ctx.reply(text, { parse_mode: 'HTML' });
};

