// -----------------------------------------------------------------------------
// Reply & inline keyboards shown to regular users.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import config from '../config/index.js';
import { BUTTONS, ACTIONS, PAYMENT_METHODS } from '../utils/constants.js';

/**
 * Main reply keyboard (persistent menu).
 */
export const mainMenuKeyboard = () =>
  Markup.keyboard([
    [BUTTONS.BUY_PREMIUM],
    [BUTTONS.PROFILE, BUTTONS.REFERRAL],
    [BUTTONS.CABINET, BUTTONS.WITHDRAW],
    [BUTTONS.CONTACT_ADMIN],
  ]).resize();

/**
 * Inline keyboard listing the required channels + a check button.
 */
export const subscriptionKeyboard = () => {
  const rows = config.channels.map((channel, index) =>
    [Markup.button.url(`📢 ${channel.title || `Kanal ${index + 1}`}`, channel.link || '#')],
  );
  rows.push([Markup.button.callback('✅ Tekshirish', ACTIONS.CHECK_SUBSCRIPTION)]);
  return Markup.inlineKeyboard(rows);
};

/**
 * Inline keyboard listing premium plans.
 */
export const plansKeyboard = () =>
  Markup.inlineKeyboard(
    config.plans.map((plan) => [
      Markup.button.callback(`${plan.title}`, `${ACTIONS.BUY_PLAN}:${plan.key}`),
    ]),
  );

/**
 * Inline keyboard with payment methods for a given plan.
 */
export const paymentMethodsKeyboard = (plan) => {
  const rows = [
    [Markup.button.callback('💳 Click', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.CLICK}`)],
    [Markup.button.callback('💳 Payme', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.PAYME}`)],
    [Markup.button.callback('💳 Uzum Bank', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.UZUM}`)],
  ];
  if (plan.stars > 0) {
    rows.push([Markup.button.callback(`⭐ Telegram Stars (${plan.stars}⭐)`, `${ACTIONS.PAY_STARS}:${plan.key}`)]);
  }
  rows.push([Markup.button.callback('💼 Balansdan to\'lash', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.BALANCE}`)]);
  rows.push([Markup.button.callback('⬅️ Orqaga', ACTIONS.BUY_PLAN)]);
  return Markup.inlineKeyboard(rows);
};

/**
 * After choosing a manual method, the user confirms payment.
 */
export const confirmPaymentKeyboard = (planKey, method) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ To\'lovni tasdiqlash', `${ACTIONS.PAY_METHOD}:${planKey}:${method}:confirm`)],
    [Markup.button.callback('❌ Bekor qilish', ACTIONS.CANCEL)],
  ]);

/**
 * Cabinet inline keyboard (history navigation).
 */
export const cabinetKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('⭐ Xaridlar tarixi', 'history:orders')],
    [Markup.button.callback('💳 To\'lovlar tarixi', 'history:payments')],
    [Markup.button.callback('💸 Pul yechishlar', 'history:withdrawals')],
  ]);

/**
 * Generic cancel inline keyboard (used inside scenes).
 */
export const cancelKeyboard = () =>
  Markup.inlineKeyboard([[Markup.button.callback('❌ Bekor qilish', ACTIONS.CANCEL)]]);

/**
 * Remove the reply keyboard.
 */
export const removeKeyboard = () => Markup.removeKeyboard();
