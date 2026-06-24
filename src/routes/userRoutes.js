// -----------------------------------------------------------------------------
// User-facing routes — TO'LIQ VERSIYA.
// Stars sotib olish/sotish route'lari qo'shildi.
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
import {
  showBuyStars,
  handleBuyStarsAmount,
  handleBuyStarsCustom,
  confirmBuyStars,
  showSellStars,
  handleSellStarsAmount,
  handleSellStarsCustom,
  confirmSellStars,
} from '../controllers/starsController.js';
import { isAdmin } from '../config/index.js';
import { mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { BUTTONS, ACTIONS } from '../utils/constants.js';
import messages from '../utils/messages.js';

export const registerUserRoutes = (bot) => {
  // ── Commands ──────────────────────────────────────────────────────────────
  bot.start(handleStart);

  // ── Subscription ──────────────────────────────────────────────────────────
  bot.action(ACTIONS.CHECK_SUBSCRIPTION, handleCheckSubscription);

  // ── Global cancel (outside scenes) ───────────────────────────────────────
  bot.action(ACTIONS.CANCEL, async (ctx) => {
    await ctx.answerCbQuery('Bekor qilindi');
    try { await ctx.deleteMessage(); } catch (_err) {}
    return ctx.reply(messages.cancelled, {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(isAdmin(ctx.from?.id)),
    });
  });

  // ── Main menu buttons ─────────────────────────────────────────────────────
  bot.hears(BUTTONS.BUY_PREMIUM, showPlans);
  bot.hears(BUTTONS.BUY_STARS, showBuyStars);
  bot.hears(BUTTONS.SELL_STARS, showSellStars);
  bot.hears(BUTTONS.REFERRAL, async (ctx) => {
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

  // ── Cabinet inline ────────────────────────────────────────────────────────
  bot.action(ACTIONS.CABINET_PROFILE, showProfileInline);
  bot.action(ACTIONS.CABINET_REFERRAL, showReferralInline);
  bot.action(ACTIONS.CABINET_ORDERS, showOrderHistory);
  bot.action(ACTIONS.CABINET_PAYMENTS, showPaymentHistory);
  bot.action(ACTIONS.CABINET_WITHDRAWALS, showWithdrawalHistory);
  bot.action(ACTIONS.CABINET_WITHDRAW, startWithdrawFromCabinet);

  // ── Premium flow ──────────────────────────────────────────────────────────
  bot.action(ACTIONS.BUY_PLAN, showPlans);
  bot.action(new RegExp(`^${ACTIONS.BUY_PLAN}:([^:]+)$`), showPlanDetails);
  bot.action(
    new RegExp(`^${ACTIONS.PAY_METHOD}:([^:]+):([^:]+)(?::(confirm))?$`),
    handlePaymentMethod,
  );
  bot.action(new RegExp(`^${ACTIONS.PAY_STARS}:([^:]+)$`), handleStarsInvoice);

  // ── Stars to'lovi lifecycle ───────────────────────────────────────────────
  bot.on('pre_checkout_query', handlePreCheckout);
  bot.on('successful_payment', handleSuccessfulPayment);

  // ── Stars sotib olish ─────────────────────────────────────────────────────
  bot.action(new RegExp(`^${ACTIONS.BUY_STARS_AMOUNT}:(\\d+)$`), handleBuyStarsAmount);
  bot.action(ACTIONS.BUY_STARS_CUSTOM, handleBuyStarsCustom);

  // ── Stars sotish ──────────────────────────────────────────────────────────
  bot.action(new RegExp(`^${ACTIONS.SELL_STARS_AMOUNT}:(\\d+)$`), handleSellStarsAmount);
  bot.action(ACTIONS.SELL_STARS_CUSTOM, handleSellStarsCustom);

  // ── Stars tasdiqlash (buy yoki sell) ──────────────────────────────────────
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_STARS}:(buy):(\\d+)$`), confirmBuyStars);
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_STARS}:(sell):(\\d+)$`), confirmSellStars);
};

export default registerUserRoutes;



