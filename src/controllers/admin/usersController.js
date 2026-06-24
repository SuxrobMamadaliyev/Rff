// -----------------------------------------------------------------------------
// Reply & inline keyboards shown to regular users.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import config from '../config/index.js';
import { BUTTONS, ACTIONS, PAYMENT_METHODS } from '../utils/constants.js';

/**
 * Main reply keyboard — admin uchun Admin panel tugmasi ko'rinadi.
 * @param {boolean} isAdmin
 */
export const mainMenuKeyboard = (isAdmin = false) => {
  const rows = [
    [BUTTONS.BUY_PREMIUM],
    [BUTTONS.REFERRAL, BUTTONS.WITHDRAW],
    [BUTTONS.CABINET, BUTTONS.CONTACT_ADMIN],
  ];
  if (isAdmin) {
    rows.push([BUTTONS.ADMIN_PANEL]);
  }
  return Markup.keyboard(rows).resize();
};

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
      Markup.button.callback(`${plan.title} — ${plan.price.toLocaleString('ru-RU')} so'm`, `${ACTIONS.BUY_PLAN}:${plan.key}`),
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
 * Kabinet inline keyboard — profil, referal, tarixlar, pul yechish hammasi shu yerda.
 */
export const cabinetKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('👤 Profil', ACTIONS.CABINET_PROFILE)],
    [Markup.button.callback('👥 Referal', ACTIONS.CABINET_REFERRAL)],
    [Markup.button.callback('⭐ Xaridlar tarixi', ACTIONS.CABINET_ORDERS)],
    [Markup.button.callback('💳 To\'lovlar tarixi', ACTIONS.CABINET_PAYMENTS)],
    [Markup.button.callback('💸 Pul yechishlar', ACTIONS.CABINET_WITHDRAWALS)],
    [Markup.button.callback('💳 Pul yechish', ACTIONS.CABINET_WITHDRAW)],
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

