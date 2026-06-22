// -----------------------------------------------------------------------------
// Admin routes: panel buttons and moderation callbacks. Every handler is
// wrapped with `requireAdmin` (and inline callbacks are also guarded) so only
// admins can trigger them.
// -----------------------------------------------------------------------------
import { requireAdmin } from '../middlewares/admin.js';
import {
  openPanel,
  exitPanel,
  enterAddBalance,
  enterSubBalance,
  enterBonus,
  enterBroadcast,
  enterForward,
  enterBan,
  enterUnban,
} from '../controllers/admin/adminController.js';
import { showStatistics } from '../controllers/admin/statsController.js';
import { listUsers } from '../controllers/admin/usersController.js';
import { listPayments, listOrders } from '../controllers/admin/listController.js';
import {
  showSettings,
  toggleSubscription,
  toggleBot,
} from '../controllers/admin/settingsController.js';
import {
  confirmOrder,
  declineOrder,
  confirmWithdrawal,
  declineWithdrawal,
  replyTicket,
  closeTicketHandler,
} from '../controllers/admin/moderationController.js';
import { ADMIN_BUTTONS, ACTIONS } from '../utils/constants.js';

/**
 * Register all admin routes on the bot instance.
 * @param {import('telegraf').Telegraf} bot
 */
export const registerAdminRoutes = (bot) => {
  // ----- Panel open / close -----
  bot.command('admin', requireAdmin(openPanel));
  bot.hears(ADMIN_BUTTONS.EXIT, requireAdmin(exitPanel));

  // ----- Panel buttons -----
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

  // ----- Settings toggles (inline) -----
  bot.action('settings:toggle_sub', requireAdmin(toggleSubscription));
  bot.action('settings:toggle_bot', requireAdmin(toggleBot));

  // ----- Moderation callbacks (inline) -----
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_ORDER}:(.+)$`), requireAdmin(confirmOrder));
  bot.action(new RegExp(`^${ACTIONS.REJECT_ORDER}:(.+)$`), requireAdmin(declineOrder));
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_WITHDRAW}:(.+)$`), requireAdmin(confirmWithdrawal));
  bot.action(new RegExp(`^${ACTIONS.REJECT_WITHDRAW}:(.+)$`), requireAdmin(declineWithdrawal));
  bot.action(new RegExp(`^${ACTIONS.REPLY_TICKET}:(.+)$`), requireAdmin(replyTicket));
  bot.action(new RegExp(`^${ACTIONS.CLOSE_TICKET}:(.+)$`), requireAdmin(closeTicketHandler));
};

export default registerAdminRoutes;
