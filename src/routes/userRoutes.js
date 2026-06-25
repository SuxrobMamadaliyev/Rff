// -----------------------------------------------------------------------------
// User routes — TO'LIQ INLINE versiya.
// -----------------------------------------------------------------------------
import { handleStart, handleCheckSubscription, showMainMenu } from '../controllers/startController.js';
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
import { buildReferralLink } from '../utils/helpers.js';
import { isAdmin } from '../config/index.js';
import { mainMenuKeyboard, menuText } from '../keyboards/userKeyboards.js';
import { ACTIONS } from '../utils/constants.js';
import messages from '../utils/messages.js';

export const registerUserRoutes = (bot) => {
  // ── Commands ──────────────────────────────────────────────────────────────
  bot.start(handleStart);

  // ── Subscription ──────────────────────────────────────────────────────────
  bot.action(ACTIONS.CHECK_SUBSCRIPTION, handleCheckSubscription);

  // ── Asosiy menyu ──────────────────────────────────────────────────────────
  bot.action(ACTIONS.MENU, showMainMenu);

  // ── Cancel ────────────────────────────────────────────────────────────────
  bot.action(ACTIONS.CANCEL, async (ctx) => {
    await ctx.answerCbQuery('Bekor qilindi');
    const user = ctx.state.user;
    const admin = isAdmin(ctx.from?.id);
    const name = user?.firstName || 'Foydalanuvchi';
    try {
      await ctx.editMessageText(menuText(name), {
        parse_mode: 'HTML',
        ...mainMenuKeyboard(admin),
      });
    } catch (_err) {
      await ctx.reply(menuText(name), {
        parse_mode: 'HTML',
        ...mainMenuKeyboard(admin),
      });
    }
  });

  // ── Menyu tugmalari ───────────────────────────────────────────────────────
  bot.action(ACTIONS.MENU_PREMIUM, showPlans);
  bot.action(ACTIONS.MENU_BUY_STARS, showBuyStars);
  bot.action(ACTIONS.MENU_SELL_STARS, showSellStars);
  bot.action(ACTIONS.MENU_CABINET, async (ctx) => {
    await ctx.answerCbQuery();
    return showCabinet(ctx);
  });
  bot.action(ACTIONS.MENU_WITHDRAW, async (ctx) => {
    await ctx.answerCbQuery();
    return startWithdraw(ctx);
  });
  bot.action(ACTIONS.MENU_CONTACT, async (ctx) => {
    await ctx.answerCbQuery();
    return startTicket(ctx);
  });
  bot.action(ACTIONS.MENU_REFERRAL, async (ctx) => {
    await ctx.answerCbQuery();
    const user = ctx.state.user;
    const link = buildReferralLink(user.telegramId);
    return ctx.reply(messages.referral(user, link), {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  });

  // ── Cabinet ───────────────────────────────────────────────────────────────
  bot.action(ACTIONS.CABINET_PROFILE, showProfileInline);
  bot.action(ACTIONS.CABINET_REFERRAL, showReferralInline);
  bot.action(ACTIONS.CABINET_ORDERS, showOrderHistory);
  bot.action(ACTIONS.CABINET_PAYMENTS, showPaymentHistory);
  bot.action(ACTIONS.CABINET_WITHDRAWALS, showWithdrawalHistory);
  bot.action(ACTIONS.CABINET_WITHDRAW, startWithdrawFromCabinet);

  // ── Premium ───────────────────────────────────────────────────────────────
  bot.action(ACTIONS.BUY_PLAN, showPlans);
  bot.action(new RegExp(`^${ACTIONS.BUY_PLAN}:([^:]+)$`), showPlanDetails);
  bot.action(
    new RegExp(`^${ACTIONS.PAY_METHOD}:([^:]+):([^:]+)(?::(confirm))?$`),
    handlePaymentMethod,
  );
  bot.action(new RegExp(`^${ACTIONS.PAY_STARS}:([^:]+)$`), handleStarsInvoice);

  // ── Stars to'lov lifecycle ────────────────────────────────────────────────
  bot.on('pre_checkout_query', handlePreCheckout);
  bot.on('successful_payment', handleSuccessfulPayment);

  // ── Stars sotib olish ─────────────────────────────────────────────────────
  bot.action(new RegExp(`^${ACTIONS.BUY_STARS_AMOUNT}:(\\d+)$`), handleBuyStarsAmount);
  bot.action(ACTIONS.BUY_STARS_CUSTOM, handleBuyStarsCustom);

  // ── Stars sotish ──────────────────────────────────────────────────────────
  bot.action(new RegExp(`^${ACTIONS.SELL_STARS_AMOUNT}:(\\d+)$`), handleSellStarsAmount);
  bot.action(ACTIONS.SELL_STARS_CUSTOM, handleSellStarsCustom);

  // ── Stars tasdiqlash ──────────────────────────────────────────────────────
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_STARS}:(buy):(\\d+)$`), confirmBuyStars);
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_STARS}:(sell):(\\d+)$`), confirmSellStars);

  // ── Fallback text ─────────────────────────────────────────────────────────
  bot.on('text', async (ctx) => {
    const admin = isAdmin(ctx.from?.id);
    const user = ctx.state.user;
    const name = user?.firstName || 'Foydalanuvchi';
    return ctx.reply(menuText(name), {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(admin),
    });
  });
};

export default registerUserRoutes;





