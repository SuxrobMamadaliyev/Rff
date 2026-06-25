// -----------------------------------------------------------------------------
// Keyboards — TO'LIQ INLINE versiya (Hamyon uslubi).
// Reply keyboard yo'q, hammasi inline.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import config from '../config/index.js';
import { ACTIONS, PAYMENT_METHODS } from '../utils/constants.js';

/**
 * Asosiy menyu — TO'LIQ INLINE.
 */
export const mainMenuKeyboard = (isAdmin = false) => {
  const rows = [
    [
      // Premium olish - Ko'k, Kabinet - Yashil
      { text: '⭐ Premium sotib olish', callback_data: ACTIONS.MENU_PREMIUM, style: "primary" },
      { text: '🗄 Kabinet', callback_data: ACTIONS.MENU_CABINET, style: "success" },
    ],
    [
      // Stars olish - Yashil, Stars sotish - Qizil
      { text: '⭐ Stars sotib olish', callback_data: ACTIONS.MENU_BUY_STARS, style: "success" },
      { text: '💰 Stars sotish', callback_data: ACTIONS.MENU_SELL_STARS, style: "danger" },
    ],
    [
      // Referal - Ko'k, Pul yechish - Qizil
      { text: '👥 Referal', callback_data: ACTIONS.MENU_REFERRAL, style: "primary" },
      { text: '💳 Pul yechish', callback_data: ACTIONS.MENU_WITHDRAW, style: "danger" },
    ],
    [
      // Aloqa - Ko'k
      { text: '📞 Admin bilan bog\'lanish', callback_data: ACTIONS.MENU_CONTACT, style: "primary" },
    ],
  ];

  if (isAdmin) {
    rows.push([
      // Admin panel - Tizim boshqaruvi bo'lgani uchun Qizil
      { text: '🛠 Admin panel', callback_data: ACTIONS.MENU_ADMIN, style: "danger" }
    ]);
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
 * To'lov usullari — faqat Stars va Admin kartasi.
 */
export const paymentMethodsKeyboard = (plan) => {
  const rows = [];

  if (plan.stars > 0) {
    rows.push([
      Markup.button.callback(
        `⭐ Telegram Stars (${plan.stars}⭐) — Avtomatik`,
        `${ACTIONS.PAY_STARS}:${plan.key}`,
      ),
    ]);
  }

  rows.push([
    Markup.button.callback(
      '💳 Admin kartasi',
      `${ACTIONS.PAY_CARD}:${plan.key}`,
    ),
  ]);

  rows.push([Markup.button.callback('⬅️ Orqaga', ACTIONS.BUY_PLAN)]);
  return Markup.inlineKeyboard(rows);
};

/**
 * Admin karta ma'lumotlari ko'rsatilgandan keyin "Tashladim" tugmasi.
 */
export const cardSentKeyboard = (planKey) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tashladim (chek yuborish)', `${ACTIONS.CARD_SENT_CHECK}:${planKey}`)],
    [Markup.button.callback('❌ Bekor qilish', ACTIONS.CANCEL)],
  ]);

/**
 * Chek yuborish so'ralgandan keyin bekor qilish.
 */
export const cancelKeyboard = () =>
  Markup.inlineKeyboard([[Markup.button.callback('❌ Bekor qilish', ACTIONS.CANCEL)]]);

/**
 * Stars tasdiqlash.
 */
export const confirmStarsKeyboard = (type, amount) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Tasdiqlash', `${ACTIONS.CONFIRM_STARS}:${type}:${amount}`)],
    [Markup.button.callback('⬅️ Orqaga', ACTIONS.MENU)],
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
 * Reply keyboard'ni o'chirish (faqat /start da bir marta).
 */
export const removeKeyboard = () => Markup.removeKeyboard();




