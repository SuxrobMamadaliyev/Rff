// -----------------------------------------------------------------------------
// Stars sotib olish va sotish uchun wizard scene'lar.
// Narxlar Settings'dan dinamik o'qiladi.
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import { cancelKeyboard, mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { notifyAdmins } from '../services/notifyService.js';
import { isAdmin } from '../config/index.js';
import config from '../config/index.js';
import { SCENES, STARS_PRICES } from '../utils/constants.js';
import { formatMoney, displayName, escapeHtml } from '../utils/helpers.js';
import { Settings } from '../models/index.js';

/** Settings'dan kurs olish */
const getRates = async () => {
  const settings = await Settings.getSettings();
  return {
    buyRate: settings.starsBuyRate ?? STARS_PRICES.BUY_RATE,
    sellRate: settings.starsSellRate ?? STARS_PRICES.SELL_RATE,
    cardNumber: settings.cardNumber ?? config.payments.cardNumber,
    cardHolder: settings.cardHolder ?? config.payments.cardHolder,
  };
};

// ─── Stars SOTIB OLISH scene ──────────────────────────────────────────────────
export const starsBuyScene = new Scenes.WizardScene(
  SCENES.STARS_BUY,

  async (ctx) => {
    const { buyRate } = await getRates();
    const preset = ctx.scene.state?.presetAmount;
    if (preset && preset > 0) {
      const totalPrice = preset * buyRate;
      ctx.wizard.state.amount = preset;
      ctx.wizard.state.totalPrice = totalPrice;
      await ctx.reply(
        `✅ Miqdor: <b>${preset} ⭐</b> | To'lov: <b>${formatMoney(totalPrice)}</b>\n\n` +
        `📱 Telegram <b>username</b>ingizni yuboring\n` +
        `<i>(Stars shu akkauntga yuboriladi, masalan: @username)</i>`,
        { parse_mode: 'HTML', ...cancelKeyboard() },
      );
      ctx.wizard.next();
      return ctx.wizard.next();
    }

    await ctx.reply(
      `⭐ <b>Stars sotib olish</b>\n\n` +
      `Narx: <b>1 Stars = ${buyRate.toLocaleString('ru-RU')} so'm</b>\n\n` +
      `Nechta Stars sotib olmoqchisiz?\n<i>(Raqam kiriting, masalan: 150)</i>`,
      { parse_mode: 'HTML', ...cancelKeyboard() },
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    const { buyRate } = await getRates();
    const text = ctx.message?.text?.trim();
    const amount = parseInt(text, 10);

    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      await ctx.reply('❌ Noto\'g\'ri miqdor. Musbat butun son kiriting:', { parse_mode: 'HTML', ...cancelKeyboard() });
      return undefined;
    }
    if (amount < 10) {
      await ctx.reply('❌ Minimal miqdor: 10 Stars. Qaytadan kiriting:', { parse_mode: 'HTML', ...cancelKeyboard() });
      return undefined;
    }

    const totalPrice = amount * buyRate;
    ctx.wizard.state.amount = amount;
    ctx.wizard.state.totalPrice = totalPrice;

    await ctx.reply(
      `✅ Miqdor: <b>${amount} ⭐</b> | To'lov: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `📱 Telegram <b>username</b>ingizni yuboring\n` +
      `<i>(Stars shu akkauntga yuboriladi, masalan: @username)</i>`,
      { parse_mode: 'HTML', ...cancelKeyboard() },
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    const text = ctx.message?.text?.trim();
    if (!text) {
      await ctx.reply('❌ Username yuboring:', { parse_mode: 'HTML', ...cancelKeyboard() });
      return undefined;
    }

    const username = text.startsWith('@') ? text : `@${text}`;
    ctx.wizard.state.username = username;

    const { amount, totalPrice } = ctx.wizard.state;
    const { cardNumber, cardHolder } = await getRates();

    await ctx.reply(
      `💳 <b>To'lov ma'lumotlari</b>\n\n` +
      `⭐ Miqdor: <b>${amount} Stars</b>\n` +
      `📱 Username: <b>${escapeHtml(username)}</b>\n` +
      `💰 To'lov summasi: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `Quyidagi karta raqamiga o'tkazing:\n\n` +
      `💳 <code>${escapeHtml(cardNumber)}</code>\n` +
      `👤 <b>${escapeHtml(cardHolder)}</b>\n\n` +
      `To'lovni amalga oshirgach, chek (screenshot) yuboring 👇`,
      { parse_mode: 'HTML', ...cancelKeyboard() },
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    const hasPhoto = ctx.message?.photo;
    const hasDoc = ctx.message?.document;

    if (!hasPhoto && !hasDoc) {
      await ctx.reply(
        '📸 Iltimos, to\'lov chekini <b>rasm</b> yoki <b>fayl</b> ko\'rinishida yuboring:',
        { parse_mode: 'HTML', ...cancelKeyboard() },
      );
      return undefined;
    }

    const { amount, totalPrice, username } = ctx.wizard.state;
    const user = ctx.state.user;

    await ctx.reply(
      `✅ <b>Chekingiz qabul qilindi!</b>\n\n` +
      `⭐ Miqdor: <b>${amount} Stars</b>\n` +
      `📱 Username: <b>${escapeHtml(username)}</b>\n` +
      `💰 To'lov: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `Admin chekni tekshirib, Stars yuboradi. Tez orada xabar olasiz! 🙏`,
      { parse_mode: 'HTML', ...mainMenuKeyboard(isAdmin(ctx.from.id)) },
    );

    const adminText =
      `⭐ <b>Stars sotib olish so'rovi</b>\n\n` +
      `👤 Foydalanuvchi: ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
      `📱 Stars yuborish: <b>${escapeHtml(username)}</b>\n` +
      `⭐ Miqdor: <b>${amount} Stars</b>\n` +
      `💰 To'lov: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `📸 Chek quyida ↓`;

    await notifyAdmins(ctx.telegram, adminText);

    try {
      if (hasPhoto) {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const caption = (ctx.message.caption || '').trim();
        for (const adminId of config.adminIds) {
          try {
            await ctx.telegram.sendPhoto(adminId, fileId, {
              caption: `📸 Chek | ${amount}⭐ → ${username}${caption ? '\n' + caption : ''}`,
              parse_mode: 'HTML',
            });
          } catch (_) {}
        }
      } else {
        const fileId = ctx.message.document.file_id;
        const caption = (ctx.message.caption || '').trim();
        for (const adminId of config.adminIds) {
          try {
            await ctx.telegram.sendDocument(adminId, fileId, {
              caption: `📄 Chek | ${amount}⭐ → ${username}${caption ? '\n' + caption : ''}`,
              parse_mode: 'HTML',
            });
          } catch (_) {}
        }
      }
    } catch (_) {}

    return ctx.scene.leave();
  },
);

// ─── Stars SOTISH scene ───────────────────────────────────────────────────────
export const starsSellScene = new Scenes.WizardScene(
  SCENES.STARS_SELL,

  async (ctx) => {
    const { sellRate } = await getRates();
    await ctx.reply(
      `💰 <b>Stars sotish</b>\n\n` +
      `Narx: <b>1 Stars = ${sellRate.toLocaleString('ru-RU')} so'm</b>\n\n` +
      `Nechta Stars sotmoqchisiz? (raqam kiriting, masalan: 150)`,
      { parse_mode: 'HTML', ...cancelKeyboard() },
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    const { sellRate } = await getRates();
    const text = ctx.message?.text?.trim();
    const amount = parseInt(text, 10);

    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      await ctx.reply('❌ Noto\'g\'ri miqdor. Musbat butun son kiriting:', cancelKeyboard());
      return undefined;
    }
    if (amount < 10) {
      await ctx.reply('❌ Minimal miqdor: 10 Stars. Qaytadan kiriting:', cancelKeyboard());
      return undefined;
    }

    const totalPrice = amount * sellRate;

    await ctx.reply(
      `💰 <b>Stars sotish</b>\n\n` +
      `⭐ Miqdor: <b>${amount} Stars</b>\n` +
      `💰 Olasiz: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `Quyidagi invoysni to'lab, Stars'ingizni botga o'tkazing 👇`,
      { parse_mode: 'HTML' },
    );

    await ctx.replyWithInvoice({
      title: `${amount} ⭐ Stars sotish`,
      description: `Siz ${amount} Stars sotmoqdasiz. To'lovni tasdiqlang — Stars botga o'tkaziladi, so'ng admin to'lovingizni yuboradi.`,
      payload: `sell_stars:${amount}`,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: `${amount} Stars`, amount }],
    });

    return ctx.scene.leave();
  },
);

export default [starsBuyScene, starsSellScene];
