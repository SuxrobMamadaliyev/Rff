import { requireAdmin } from '../middlewares/admin.js';
import {
  openPanel, exitPanel,
  enterAddBalance, enterSubBalance, enterBonus,
  enterBroadcast, enterForward, enterBan, enterUnban,
} from '../controllers/admin/adminController.js';
import { showStatistics } from '../controllers/admin/statsController.js';
import { listUsers } from '../controllers/admin/usersController.js';
import { listPayments, listOrders } from '../controllers/admin/listController.js';
import {
  showSettings, toggleSubscription, toggleBot,
  showPricesMenu, showCardMenu, showStarsRateMenu,
} from '../controllers/admin/settingsController.js';
import {
  confirmOrder, declineOrder,
  confirmWithdrawal, declineWithdrawal,
  replyTicket, closeTicketHandler,
} from '../controllers/admin/moderationController.js';
import { ADMIN_BUTTONS, ACTIONS, SCENES } from '../utils/constants.js';

export const registerAdminRoutes = (bot) => {
  // Admin panel
  bot.action(ACTIONS.MENU_ADMIN, requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return openPanel(ctx);
  }));
  bot.command('admin', requireAdmin(openPanel));

  // Admin panel REPLY tugmalar
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

  // Narxlar tugmasi — to'g'ridan showPricesMenu chaqiradi
  bot.hears(ADMIN_BUTTONS.PRICES, requireAdmin(async (ctx) => {
    // showPricesMenu answerCbQuery kutadi, lekin bu hears — shunchaki chaqiramiz
    const settings = await (await import('../models/index.js')).Settings.getSettings();
    const config = (await import('../config/index.js')).default;
    const { Markup } = await import('telegraf');

    const buttons = config.plans.map((plan) => {
      const override = settings.planPrices?.find((p) => p.key === plan.key);
      const price = override?.price ?? plan.price;
      const stars = override?.stars ?? plan.stars;
      return [
        Markup.button.callback(
          `${plan.title}: ${price.toLocaleString('ru-RU')} so'm / ${stars}⭐`,
          `price_edit:${plan.key}`,
        ),
      ];
    });
    buttons.push([Markup.button.callback('⬅️ Orqaga', 'settings:back')]);

    return ctx.reply(
      `💲 <b>Narxlarni o\'zgartirish</b>\n\nTarifni tanlang:`,
      { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) },
    );
  }));

  // Karta tugmasi
  bot.hears(ADMIN_BUTTONS.CARD_INFO, requireAdmin(async (ctx) => {
    const settings = await (await import('../models/index.js')).Settings.getSettings();
    const config = (await import('../config/index.js')).default;
    const { Markup } = await import('telegraf');

    const cardNumber = settings.cardNumber ?? config.payments.cardNumber;
    const cardHolder = settings.cardHolder ?? config.payments.cardHolder;

    return ctx.reply(
      `💳 <b>Karta ma\'lumotlari</b>\n\nRaqam: <code>${cardNumber}</code>\nEgasi: <b>${cardHolder}</b>`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💳 Karta raqamini o\'zgartirish', 'settings:edit_card_number')],
          [Markup.button.callback('👤 Karta egasini o\'zgartirish', 'settings:edit_card_holder')],
          [Markup.button.callback('📈 Stars sotib olish kursi', 'settings:edit_buy_rate')],
          [Markup.button.callback('📉 Stars sotish kursi', 'settings:edit_sell_rate')],
        ]),
      },
    );
  }));

  // Settings inline actions
  bot.action('settings:toggle_sub', requireAdmin(toggleSubscription));
  bot.action('settings:toggle_bot', requireAdmin(toggleBot));
  bot.action('settings:prices', requireAdmin(showPricesMenu));
  bot.action('settings:card', requireAdmin(showCardMenu));
  bot.action('settings:stars_rate', requireAdmin(showStarsRateMenu));
  bot.action('settings:back', requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return showSettings(ctx);
  }));

  // Karta o'zgartirish scene'lari
  bot.action('settings:edit_card_number', requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.scene.enter(SCENES.ADMIN_EDIT_CARD, { field: 'number' });
  }));
  bot.action('settings:edit_card_holder', requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.scene.enter(SCENES.ADMIN_EDIT_CARD, { field: 'holder' });
  }));

  // Stars kurs scene'lari
  bot.action('settings:edit_buy_rate', requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.scene.enter(SCENES.ADMIN_EDIT_STARS_RATE, { rateType: 'buy' });
  }));
  bot.action('settings:edit_sell_rate', requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.scene.enter(SCENES.ADMIN_EDIT_STARS_RATE, { rateType: 'sell' });
  }));

  // Plan narx o'zgartirish
  bot.action(new RegExp(`^price_edit:(.+)$`), requireAdmin(async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.scene.enter(SCENES.ADMIN_EDIT_PLAN_PRICE, { planKey: ctx.match[1] });
  }));

  // Moderation
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_ORDER}:(.+)$`), requireAdmin(confirmOrder));
  bot.action(new RegExp(`^${ACTIONS.REJECT_ORDER}:(.+)$`), requireAdmin(declineOrder));
  bot.action(new RegExp(`^${ACTIONS.CONFIRM_WITHDRAW}:(.+)$`), requireAdmin(confirmWithdrawal));
  bot.action(new RegExp(`^${ACTIONS.REJECT_WITHDRAW}:(.+)$`), requireAdmin(declineWithdrawal));
  bot.action(new RegExp(`^${ACTIONS.REPLY_TICKET}:(.+)$`), requireAdmin(replyTicket));
  bot.action(new RegExp(`^${ACTIONS.CLOSE_TICKET}:(.+)$`), requireAdmin(closeTicketHandler));
};

export default registerAdminRoutes;
