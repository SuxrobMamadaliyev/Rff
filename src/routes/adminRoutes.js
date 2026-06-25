import { requireAdmin } from '../middlewares/admin.js';
import {
  openPanel, exitPanel,
  enterAddBalance, enterSubBalance, enterBonus,
  enterBroadcast, enterForward, enterBan, enterUnban,
} from '../controllers/admin/adminController.js';
import { showStatistics } from '../controllers/admin/statsController.js';
import { listUsers } from '../controllers/admin/usersController.js';
import { listPayments, listOrders } from '../controllers/admin/listController.js';
import { showSettings, toggleSubscription, toggleBot } from '../controllers/admin/settingsController.js';
import {
  confirmOrder, declineOrder,
  confirmWithdrawal, declineWithdrawal,
  replyTicket, closeTicketHandler,
} from '../controllers/admin/moderationController.js';
import { ADMIN_BUTTONS, ACTIONS } from '../utils/constants.js';

export const registerAdminRoutes = (bot) => {
  // Admin panel — INLINE callback
  bot.action(ACTIONS.MENU_ADMIN, requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return openPanel(ctx);
  }));
  bot.command('admin', requireAdmin(openPanel));

  // Admin panel ichidagi REPLY tugmalar
  bot.hears(ADMIN_BUTTONS.EXIT, requireAdmin(exitPanel));
  bot.hears(ADMIN_BUTTONS.STATS, requireAdmin(showStatistics));
  bot.hears(ADMIN_BUTTONS.USERS, requireAdmin(listUsers));
  bot.hears(ADMIN_BUTTONS.ADD_BALANCE, requireAdmin(enterAddBalance));
  bot.hears(ADMIN_BUTTONS.SUB_BALANCE, requireAdmin(enterSubBalance));
  bot.hears(ADMIN_BUTTONS.BONUS, requireAdmin(enterBonus));
  bot.hears(ADMIN_BUTTONS.BROADCAST, requireAdmin(enterBroadcast));
  bot.hears(ADMIN_BUTTONS.FORWARD, requireAdmin(enterForward));
  bot.hears(ADMIN_BUTTONS.BAN, requireAdmin(enterBan));
  bot.hears(ADMIN_BUTTONS.UNBAN, requireAdmin(enterUnban));
  bot.hears(ADMIN_BUTTONS.PAYMENTS, requireAdmin(listPayments));
  bot.hears(ADMIN_BUTTONS.ORDERS, requireAdmin(listOrders));
  bot.hears(ADMIN_BUTTONS.SETTINGS, requireAdmin(showSettings));

  bot.action('settings:toggle_sub', requireAdmin(toggleSubscription));
  bot.action('settings:toggle_bot', requireAdmin(toggleBot));

  bot.action(new RegExp(`^${ACTIONS.CONFIRM_ORDER}:(.+)$`), requireAdmin(confirmOrder));
  bot.action(new RegExp(`^${ACTIONS.REJECT_ORDER}:(.+)$`), requireAdmin(declineOrder));
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_WITHDRAW}:(.+)$`), requireAdmin(confirmWithdrawal));
  bot.action(new RegExp(`^${ACTIONS.REJECT_WITHDRAW}:(.+)$`), requireAdmin(declineWithdrawal));
  bot.action(new RegExp(`^${ACTIONS.REPLY_TICKET}:(.+)$`), requireAdmin(replyTicket));
  bot.action(new RegExp(`^${ACTIONS.CLOSE_TICKET}:(.+)$`), requireAdmin(closeTicketHandler));
};

export default registerAdminRoutes;




