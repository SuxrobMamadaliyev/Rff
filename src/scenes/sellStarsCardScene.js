// -----------------------------------------------------------------------------
// sellStarsCardScene — Stars sotish uchun to'lov (Stars invoyси) muvaffaqiyatli
// bo'lgandan keyin foydalanuvchidan pul tushadigan karta raqami so'raladi,
// so'ngra admin'ga to'liq tasdiqlash xabari yuboriladi.
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import { notifyAdmins } from '../services/notifyService.js';
import { cancelKeyboard, mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { SCENES } from '../utils/constants.js';
import { isAdmin } from '../config/index.js';
import { displayName, formatMoney } from '../utils/helpers.js';
import Payment from '../models/Payment.js';
import logger from '../utils/logger.js';

const sellStarsCardScene = new Scenes.BaseScene(SCENES.SELL_STARS_CARD_SCENE);

sellStarsCardScene.enter(async (ctx) => {
  await ctx.reply(
    `✅ <b>To'lov qabul qilindi!</b>\n\n` +
    `Pulingizni o'tkazib berishimiz uchun <b>karta raqamingizni</b> yuboring ` +
    `(masalan: 8600 1234 5678 9012):`,
    { parse_mode: 'HTML', ...cancelKeyboard() },
  );
});

sellStarsCardScene.on('text', async (ctx) => {
  const raw = ctx.message.text.trim();
  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.length < 16 || digitsOnly.length > 19) {
    await ctx.reply(
      "❌ Karta raqami noto'g'ri. 16 xonali karta raqamingizni qaytadan kiriting:",
      cancelKeyboard(),
    );
    return undefined;
  }

  const { amount, totalPrice, paymentId } = ctx.scene.state;
  const user = ctx.state.user;
  const maskedCard = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');

  // Karta raqamini Payment yozuviga saqlaymiz
  try {
    if (paymentId) {
      await Payment.findByIdAndUpdate(paymentId, { cardNumber: digitsOnly });
    }
  } catch (err) {
    logger.warn(`Stars sell payment update error: ${err.message}`);
  }

  await ctx.reply(
    `✅ <b>Qabul qilindi!</b>\n\n` +
    `⭐ Miqdor: <b>${amount} Stars</b>\n` +
    `💰 Summa: <b>${formatMoney(totalPrice)}</b>\n` +
    `💳 Karta: <code>${maskedCard}</code>\n\n` +
    `Admin tez orada to'lovingizni shu kartaga o'tkazadi. 🙏`,
    { parse_mode: 'HTML', ...mainMenuKeyboard(isAdmin(ctx.from.id)) },
  );

  await notifyAdmins(
    ctx.telegram,
    `💰 <b>Stars sotildi — to'lov qabul qilindi</b>\n\n` +
    `👤 Foydalanuvchi: ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
    `⭐ Miqdor: <b>${amount} Stars</b>\n` +
    `💰 Foydalanuvchiga to'lanishi kerak: <b>${formatMoney(totalPrice)}</b>\n` +
    `💳 Karta raqami: <code>${maskedCard}</code>\n\n` +
    `✅ Stars botga o'tkazildi. Yuqoridagi kartaga pul o'tkazib, foydalanuvchiga tasdiqlang.`,
  );

  return ctx.scene.leave();
});

export default sellStarsCardScene;
