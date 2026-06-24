// -----------------------------------------------------------------------------
// Keyboards — TO'LIQ INLINE versiya (Hamyon uslubi).
// Reply keyboard yo'q, hammasi inline.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import config from '../config/index.js';
import { ACTIONS, PAYMENT_METHODS } from '../utils/constants.js';

/**
 * Asosiy menyu — TO'LIQ INLINE.
 * Hamyon botdagi kabi rangli 2-ustunli tugmalar.
 * @param {boolean} isAdmin
 */
export const mainMenuKeyboard = (isAdmin = false) => {
  const rows = [
    [
      Markup.button.callback('⭐ Premium sotib olish', ACTIONS.MENU_PREMIUM),
      Markup.button.callback('🗄 Kabinet', ACTIONS.MENU_CABINET),
    ],
    [
      Markup.button.callback('⭐ Stars sotib olish', ACTIONS.MENU_BUY_STARS),
      Markup.button.callback('💰 Stars sotish', ACTIONS.MENU_SELL_STARS),
    ],
    [
      Markup.button.callback('👥 Referal', ACTIONS.MENU_REFERRAL),
      Markup.button.callback('💳 Pul yechish', ACTIONS.MENU_WITHDRAW),
    ],
    [
      Markup.button.callback('📞 Admin bilan bog\'lanish', ACTIONS.MENU_CONTACT),
    ],
  ];
  if (isAdmin) {
    rows.push([Markup.button.callback('🛠 Admin panel', ACTIONS.MENU_ADMIN)]);
  }
  return Markup.inlineKeyboard(rows);
};

/**
 * Menyu xabari uchun matn.
 */
export const menuText = (name) =>
  `👋 <b>${name}</b>, xush kelibsiz!\n\n` +
  `🤖 <b>Premium Shop</b> — kerakli xizmatni tanlang 👇`;

/**
 * Obuna tekshiruv keyboard.
 */
export const subscriptionKeyboard = () => {
  const rows = config.channels.map((channel, index) => [
    Markup.button.url(
      `📢 ${channel.title || `Kanal ${index + 1}`}`,
      channel.link || '#',
    ),
  ]);
  rows.push([Markup.button.callback('✅ Tekshirish', ACTIONS.CHECK_SUBSCRIPTION)]);
  return Markup.inlineKeyboard(rows);
};

/**
 * Premium tariflar.
 */
export const plansKeyboard = () =>
  Markup.inlineKeyboard([
    ...config.plans.map((plan) => [
      Markup.button.callback(
        `${plan.title} — ${plan.price.toLocaleString('ru-RU')} so'm`,
        `${ACTIONS.BUY_PLAN}:${plan.key}`,
      ),
    ]),
    [Markup.button.callback('⬅️ Orqaga', ACTIONS.MENU)],
  ]);

/**
 * To'lov usullari.
 */
export const paymentMethodsKeyboard = (plan) => {
  const rows = [
    [Markup.button.callback('💳 Click', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.CLICK}`)],
    [Markup.button.callback('💳 Payme', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.PAYME}`)],
    [Markup.button.callback('💳 Uzum Bank', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.UZUM}`)],
  ];
  if (plan.stars > 0) {
    rows.push([
      Markup.button.callback(
        `⭐ Telegram Stars (${plan.stars}⭐)`,
        `${ACTIONS.PAY_STARS}:${plan.key}`,
      ),
    ]);
  }
  rows.push([
    Markup.button.callback('💼 Balansdan to\'lash', `${ACTIONS.PAY_METHOD}:${plan.key}:${PAYMENT_METHODS.BALANCE}`),
  ]);
  rows.push([Markup.button.callback('⬅️ Orqaga', ACTIONS.BUY_PLAN)]);
  return Markup.inlineKeyboard(rows);
};

/**
 * To'lovni tasdiqlash.
 */
export const confirmPaymentKeyboard = (planKey, method) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ To\'lovni tasdiqlash', `${ACTIONS.PAY_METHOD}:${planKey}:${method}:confirm`)],
    [Markup.button.callback('❌ Bekor qilish', ACTIONS.CANCEL)],
  ]);

/**
 * Stars sotib olish miqdor tanlash.
 */
export const buyStarsKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('⭐ 50 Stars', `${ACTIONS.BUY_STARS_AMOUNT}:50`),
      Markup.button.callback('⭐ 100 Stars', `${ACTIONS.BUY_STARS_AMOUNT}:100`),
    ],
    [
      Markup.button.callback('⭐ 250 Stars', `${ACTIONS.BUY_STARS_AMOUNT}:250`),
      Markup.button.callback('⭐ 500 Stars', `${ACTIONS.BUY_STARS_AMOUNT}:500`),
    ],
    [Markup.button.callback('⭐ 1000 Stars', `${ACTIONS.BUY_STARS_AMOUNT}:1000`)],
    [Markup.button.callback('✍️ Boshqa miqdor', ACTIONS.BUY_STARS_CUSTOM)],
    [Markup.button.callback('⬅️ Orqaga', ACTIONS.MENU)],
  ]);

/**
 * Stars sotish miqdor tanlash.
 */
export const sellStarsKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('⭐ 50 Stars', `${ACTIONS.SELL_STARS_AMOUNT}:50`),
      Markup.button.callback('⭐ 100 Stars', `${ACTIONS.SELL_STARS_AMOUNT}:100`),
    ],
    [
      Markup.button.callback('⭐ 250 Stars', `${ACTIONS.SELL_STARS_AMOUNT}:250`),
      Markup.button.callback('⭐ 500 Stars', `${ACTIONS.SELL_STARS_AMOUNT}:500`),
    ],
    [Markup.button.callback('⭐ 1000 Stars', `${ACTIONS.SELL_STARS_AMOUNT}:1000`)],
    [Markup.button.callback('✍️ Boshqa miqdor', ACTIONS.SELL_STARS_CUSTOM)],
    [Markup.button.callback('⬅️ Orqaga', ACTIONS.MENU)],
  ]);

/**
 * Stars tasdiqlash.
 */
export const confirmStarsKeyboard = (type, amount) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tasdiqlash', `${ACTIONS.CONFIRM_STARS}:${type}:${amount}`)],
    [Markup.button.callback('⬅️ Orqaga', ACTIONS.MENU)],
  ]);

/**
 * Kabinet.
 */
export const cabinetKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('👤 Profil', ACTIONS.CABINET_PROFILE),
      Markup.button.callback('👥 Referal', ACTIONS.CABINET_REFERRAL),
    ],
    [
      Markup.button.callback('⭐ Xaridlar', ACTIONS.CABINET_ORDERS),
      Markup.button.callback('💳 To\'lovlar', ACTIONS.CABINET_PAYMENTS),
    ],
    [
      Markup.button.callback('💸 Yechishlar', ACTIONS.CABINET_WITHDRAWALS),
      Markup.button.callback('💳 Pul yechish', ACTIONS.CABINET_WITHDRAW),
    ],
    [Markup.button.callback('⬅️ Asosiy menyu', ACTIONS.MENU)],
  ]);

/**
 * Bekor qilish.
 */
export const cancelKeyboard = () =>
  Markup.inlineKeyboard([[Markup.button.callback('❌ Bekor qilish', ACTIONS.CANCEL)]]);

/**
 * Reply keyboard'ni o'chirish (faqat /start da bir marta).
 */
export const removeKeyboard = () => Markup.removeKeyboard();



