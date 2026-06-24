// -----------------------------------------------------------------------------
// User-facing routes: commands, menu buttons and inline callbacks.
// -----------------------------------------------------------------------------
import { handleStart, handleCheckSubscription } from '../controllers/startController.js';
import { showProfile } from '../controllers/profileController.js';
import { showReferral } from '../controllers/referralController.js';
import { startWithdraw } from '../controllers/withdrawalController.js';
import { startTicket } from '../controllers/ticketController.js';
import {
  showCabinet,
  showOrderHistory,
  showPaymentHistory,
  showWithdrawalHistory,
} from '../controllers/cabinetController.js';
import {
  showPlans,
  showPlanDetails,
  handlePaymentMethod,
  handleStarsInvoice,
  handlePreCheckout,
  handleSuccessfulPayment,
} from '../controllers/premiumController.js';
import { mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { BUTTONS, ACTIONS } from '../utils/constants.js';
import messages from '../utils/messages.js';

/**
 * Register all user routes on the bot instance.
 * @param {import('telegraf').Telegraf} bot
 */
export const registerUserRoutes = (bot) => {
  // ----- Commands -----
  bot.start(handleStart);

  // ----- Subscription gate -----
  bot.action(ACTIONS.CHECK_SUBSCRIPTION, handleCheckSubscription);

  // ----- Global cancel (outside scenes) -----
  bot.action(ACTIONS.CANCEL, async (ctx) => {
    await ctx.answerCbQuery('Bekor qilindi');
    try {
      await ctx.deleteMessage();
    } catch (_err) {
      // ignore
    }
    return ctx.reply(messages.cancelled, { parse_mode: 'HTML', ...mainMenuKeyboard() });
  });

  // ----- Main menu buttons -----
  bot.hears(BUTTONS.BUY_PREMIUM, showPlans);
  bot.hears(BUTTONS.PROFILE, showProfile);
  bot.hears(BUTTONS.REFERRAL, showReferral);
  bot.hears(BUTTONS.CABINET, showCabinet);
  bot.hears(BUTTONS.WITHDRAW, startWithdraw);
  bot.hears(BUTTONS.CONTACT_ADMIN, startTicket);

  // ----- Premium purchase flow (inline) -----
  // "Back to plans" (callback data is exactly "buy")
  bot.action(ACTIONS.BUY_PLAN, showPlans);
  // Plan details: buy:<planKey>
  bot.action(new RegExp(`^${ACTIONS.BUY_PLAN}:([^:]+)$`), showPlanDetails);
  // Payment method (+ optional confirm): pay:<planKey>:<method>[:confirm]
  bot.action(new RegExp(`^${ACTIONS.PAY_METHOD}:([^:]+):([^:]+)(?::(confirm))?$`), handlePaymentMethod);
  // Telegram Stars: stars:<planKey>
  bot.action(new RegExp(`^${ACTIONS.PAY_STARS}:([^:]+)$`), handleStarsInvoice);

  // ----- Cabinet history (inline) -----
  bot.action('history:orders', showOrderHistory);
  bot.action('history:payments', showPaymentHistory);
  bot.action('history:withdrawals', showWithdrawalHistory);

  // ----- Telegram Stars payment lifecycle -----
  bot.on('pre_checkout_query', handlePreCheckout);
  bot.on('successful_payment', handleSuccessfulPayment);
};

export default registerUserRoutes;

