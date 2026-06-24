// -----------------------------------------------------------------------------
// User-facing routes.
// -----------------------------------------------------------------------------
import { handleStart, handleCheckSubscription } from '../controllers/startController.js';
import { startWithdraw } from '../controllers/withdrawalController.js';
import { startTicket } from '../controllers/ticketController.js';
import {
  showCabinet,
  showProfileInline,
  showReferralInline,
  showOrderHistory,
  showPaymentHistory,
  showWithdrawalHistory,
  startWithdrawFromCabinet,
} from '../controllers/cabinetController.js';
import {
  showPlans,
  showPlanDetails,
  handlePaymentMethod,
  handleStarsInvoice,
  handlePreCheckout,
  handleSuccessfulPayment,
} from '../controllers/premiumController.js';
import { isAdmin } from '../config/index.js';
import { mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { BUTTONS, ACTIONS } from '../utils/constants.js';
import messages from '../utils/messages.js';

export const registerUserRoutes = (bot) => {
  // ----- Commands -----
  bot.start(handleStart);

  // ----- Subscription -----
  bot.action(ACTIONS.CHECK_SUBSCRIPTION, handleCheckSubscription);

  // ----- Global cancel (outside scenes) -----
  bot.action(ACTIONS.CANCEL, async (ctx) => {
    await ctx.answerCbQuery('Bekor qilindi');
    try { await ctx.deleteMessage(); } catch (_err) {}
    return ctx.reply(messages.cancelled, {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(isAdmin(ctx.from?.id)),
    });
  });

  // ----- Main menu buttons -----
  bot.hears(BUTTONS.BUY_PREMIUM, showPlans);
  bot.hears(BUTTONS.REFERRAL, async (ctx) => {
    // Referal tugmasi asosiy menuda yo'q endi, lekin qoldiramiz zaxira sifatida
    const { buildReferralLink } = await import('../utils/helpers.js');
    const user = ctx.state.user;
    const link = buildReferralLink(user.telegramId);
    return ctx.reply(messages.referral(user, link), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  });
  bot.hears(BUTTONS.WITHDRAW, startWithdraw);
  bot.hears(BUTTONS.CABINET, showCabinet);
  bot.hears(BUTTONS.CONTACT_ADMIN, startTicket);

  // ----- Kabinet inline tugmalar -----
  bot.action(ACTIONS.CABINET_PROFILE, showProfileInline);
  bot.action(ACTIONS.CABINET_REFERRAL, showReferralInline);
  bot.action(ACTIONS.CABINET_ORDERS, showOrderHistory);
  bot.action(ACTIONS.CABINET_PAYMENTS, showPaymentHistory);
  bot.action(ACTIONS.CABINET_WITHDRAWALS, showWithdrawalHistory);
  bot.action(ACTIONS.CABINET_WITHDRAW, startWithdrawFromCabinet);

  // ----- Premium flow -----
  bot.action(ACTIONS.BUY_PLAN, showPlans);
  bot.action(new RegExp(`^${ACTIONS.BUY_PLAN}:([^:]+)$`), showPlanDetails);
  bot.action(new RegExp(`^${ACTIONS.PAY_METHOD}:([^:]+):([^:]+)(?::(confirm))?$`), handlePaymentMethod);
  bot.action(new RegExp(`^${ACTIONS.PAY_STARS}:([^:]+)$`), handleStarsInvoice);

  // ----- Stars payment lifecycle -----
  bot.on('pre_checkout_query', handlePreCheckout);
  bot.on('successful_payment', handleSuccessfulPayment);
};

export default registerUserRoutes;


