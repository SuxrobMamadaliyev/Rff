// -----------------------------------------------------------------------------
// User facing text templates (Uzbek). Centralized for easy editing / i18n.
// All functions return HTML-safe strings (parse_mode: 'HTML').
// -----------------------------------------------------------------------------
import config from '../config/index.js';
import { formatMoney, formatDate, escapeHtml, displayName } from './helpers.js';

export const messages = {
  welcome: (name) =>
    `👋 Assalomu alaykum, <b>${escapeHtml(name)}</b>!\n\n` +
    `🤖 <b>Premium Shop</b> botiga xush kelibsiz.\n` +
    `Bu yerda Telegram Premium obunasini qulay narxlarda sotib olishingiz mumkin.\n\n` +
    `Quyidagi menyudan kerakli bo'limni tanlang 👇`,

  mustSubscribe:
    `🔒 <b>Botdan foydalanish uchun avval kanallarga obuna bo'ling.</b>\n\n` +
    `Quyidagi kanallarga obuna bo'lib, so'ng <b>✅ Tekshirish</b> tugmasini bosing 👇`,

  notSubscribedYet:
    `❗️ Siz hali barcha kanallarga obuna bo'lmadingiz.\n` +
    `Iltimos, obuna bo'lib qaytadan <b>✅ Tekshirish</b> tugmasini bosing.`,

  subscribed:
    `✅ Rahmat! Obuna tasdiqlandi.\n\nEndi botdan to'liq foydalanishingiz mumkin 👇`,

  mainMenu: `🏠 <b>Asosiy menyu</b>\n\nKerakli bo'limni tanlang 👇`,

  banned:
    `🚫 Siz bloklangansiz.\n\nAgar bu xato deb hisoblasangiz, administrator bilan bog'laning.`,

  // ----- Premium -----
  choosePlan: `⭐ <b>Premium tariflar</b>\n\nQuyidan o'zingizga mos tarifni tanlang 👇`,

  planDetails: (plan) =>
    `⭐ <b>${escapeHtml(plan.title)}</b>\n\n` +
    `📝 ${escapeHtml(plan.description)}\n\n` +
    `💰 Narxi: <b>${formatMoney(plan.price)}</b>\n` +
    (plan.stars > 0 ? `⭐ Telegram Stars: <b>${plan.stars} ⭐️</b>\n` : '') +
    `\nTo'lov usulini tanlang 👇`,

  paymentInstructions: (plan, method) => {
    const lines = [
      `🧾 <b>Buyurtma</b>: ${escapeHtml(plan.title)}`,
      `💰 To'lov summasi: <b>${formatMoney(plan.price)}</b>`,
      '',
    ];
    if (method === 'click') {
      lines.push(`💳 <b>Click</b> orqali to'lash:`);
      if (config.payments.clickLink) lines.push(config.payments.clickLink);
      lines.push('', `Yoki karta raqamiga o'tkazing:`);
      lines.push(`💳 <code>${escapeHtml(config.payments.cardNumber)}</code>`);
      lines.push(`👤 ${escapeHtml(config.payments.cardHolder)}`);
    } else if (method === 'payme') {
      lines.push(`💳 <b>Payme</b> orqali to'lash:`);
      if (config.payments.paymeLink) lines.push(config.payments.paymeLink);
      lines.push('', `Yoki karta raqamiga o'tkazing:`);
      lines.push(`💳 <code>${escapeHtml(config.payments.cardNumber)}</code>`);
      lines.push(`👤 ${escapeHtml(config.payments.cardHolder)}`);
    } else if (method === 'uzum') {
      lines.push(`💳 <b>Uzum Bank</b> orqali to'lash:`);
      if (config.payments.uzumLink) lines.push(config.payments.uzumLink);
      lines.push('', `Yoki karta raqamiga o'tkazing:`);
      lines.push(`💳 <code>${escapeHtml(config.payments.cardNumber)}</code>`);
      lines.push(`👤 ${escapeHtml(config.payments.cardHolder)}`);
    }
    lines.push(
      '',
      `To'lovni amalga oshirgach <b>«✅ To'lovni tasdiqlash»</b> tugmasini bosing.`,
      `Admin to'lovni tekshirib, buyurtmani faollashtiradi.`,
    );
    return lines.join('\n');
  },

  orderCreated: (plan) =>
    `✅ Buyurtmangiz qabul qilindi!\n\n` +
    `⭐ Tarif: <b>${escapeHtml(plan.title)}</b>\n` +
    `💰 Summa: <b>${formatMoney(plan.price)}</b>\n\n` +
    `Admin to'lovni tekshirgach sizga xabar beriladi. Rahmat! 🙏`,

  orderPaidFromBalance: (plan) =>
    `✅ <b>${escapeHtml(plan.title)}</b> balansingizdan muvaffaqiyatli sotib olindi!\n\n` +
    `Admin buyurtmani tez orada faollashtiradi. Rahmat! 🙏`,

  insufficientBalance:
    `❌ Balansingiz yetarli emas.\n\nReferal orqali ishlab toping yoki to'lov usulini tanlang.`,

  // ----- Profile -----
  profile: (user) =>
    `👤 <b>Profil</b>\n\n` +
    `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
    `👤 Username: ${user.username ? '@' + escapeHtml(user.username) : '—'}\n` +
    `💰 Balans: <b>${formatMoney(user.balance)}</b>\n` +
    `👥 Referallar: <b>${user.referralCount}</b> ta\n` +
    `⭐ Sotib olingan premiumlar: <b>${user.purchasedCount}</b> ta\n` +
    `📅 Ro'yxatdan o'tgan: ${formatDate(user.createdAt)}`,

  // ----- Referral -----
  referral: (user, link) =>
    `👥 <b>Referal tizimi</b>\n\n` +
    `Do'stlaringizni taklif qiling va har bir taklif uchun ` +
    `<b>${formatMoney(config.economy.referralBonus)}</b> bonus oling!\n\n` +
    `🔗 Sizning referal havolangiz:\n<code>${link}</code>\n\n` +
    `👥 Takliflar soni: <b>${user.referralCount}</b> ta\n` +
    `💰 Referal daromad: <b>${formatMoney(user.referralEarnings)}</b>`,

  // ----- Cabinet -----
  cabinet: (user) =>
    `🗄 <b>Shaxsiy kabinet</b>\n\n` +
    `💰 Balans: <b>${formatMoney(user.balance)}</b>\n` +
    `💵 Referal daromad: <b>${formatMoney(user.referralEarnings)}</b>\n` +
    `👥 Referallar: <b>${user.referralCount}</b> ta\n` +
    `⭐ Xaridlar: <b>${user.purchasedCount}</b> ta\n\n` +
    `Tarixni ko'rish uchun quyidagi tugmalardan foydalaning 👇`,

  noPurchases: `📦 Sizda hali xaridlar mavjud emas.`,
  noPayments: `💳 Sizda hali to'lovlar tarixi mavjud emas.`,
  noWithdrawals: `💸 Sizda hali pul yechish so'rovlari mavjud emas.`,

  // ----- Withdrawal -----
  withdrawStart: (balance) =>
    `💳 <b>Pul yechish</b>\n\n` +
    `Joriy balans: <b>${formatMoney(balance)}</b>\n` +
    `Minimal yechish: <b>${formatMoney(config.economy.minWithdrawal)}</b>\n\n` +
    `Karta raqamingizni yuboring (masalan: 8600 1234 5678 9012):`,
  withdrawAskAmount: `💰 Yechmoqchi bo'lgan summangizni kiriting:`,
  withdrawTooSmall: `❌ Minimal yechish summasi: <b>${formatMoney(config.economy.minWithdrawal)}</b>. Qaytadan kiriting:`,
  withdrawTooMuch: (balance) =>
    `❌ Balansingiz yetarli emas. Joriy balans: <b>${formatMoney(balance)}</b>. Qaytadan kiriting:`,
  withdrawInvalidCard: `❌ Karta raqami noto'g'ri. 16 xonali raqam yuboring:`,
  withdrawInvalidAmount: `❌ Summa noto'g'ri. Faqat raqam kiriting:`,
  withdrawCreated:
    `✅ Pul yechish so'rovingiz qabul qilindi!\n\n` +
    `Admin tekshirgach mablag' kartangizga o'tkaziladi va balansdan yechiladi.`,

  // ----- Ticket / contact admin -----
  ticketStart:
    `📞 <b>Admin bilan bog'lanish</b>\n\n` +
    `Savol yoki muammoyingizni yozib yuboring. Admin tez orada javob beradi.`,
  ticketCreated: `✅ Murojaatingiz adminга yuborildi. Tez orada javob olasiz.`,
  ticketAdminReply: (text) =>
    `📩 <b>Admindan javob:</b>\n\n${escapeHtml(text)}`,

  // ----- Common -----
  cancelled: `❌ Bekor qilindi.`,
  unknownCommand: `🤔 Buyruq tushunarsiz. Iltimos, menyudagi tugmalardan foydalaning.`,
  error: `⚠️ Xatolik yuz berdi. Birozdan so'ng qaytadan urinib ko'ring.`,

  // ----- Admin notifications -----
  adminNewOrder: (user, plan, method) =>
    `🆕 <b>Yangi buyurtma</b>\n\n` +
    `👤 Foydalanuvchi: ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
    `⭐ Tarif: <b>${escapeHtml(plan.title)}</b>\n` +
    `💰 Summa: <b>${formatMoney(plan.price)}</b>\n` +
    `💳 To'lov usuli: <b>${escapeHtml(method)}</b>`,

  adminNewWithdrawal: (user, withdrawal) =>
    `🆕 <b>Pul yechish so'rovi</b>\n\n` +
    `👤 Foydalanuvchi: ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
    `💰 Summa: <b>${formatMoney(withdrawal.amount)}</b>\n` +
    `💳 Karta: <code>${escapeHtml(withdrawal.cardNumber)}</code>\n` +
    `💼 Balans: <b>${formatMoney(user.balance)}</b>`,

  adminNewTicket: (user, text) =>
    `🆕 <b>Yangi murojaat</b>\n\n` +
    `👤 ${displayName(user)} (<code>${user.telegramId}</code>)\n\n` +
    `💬 ${escapeHtml(text)}`,
};

export default messages;
