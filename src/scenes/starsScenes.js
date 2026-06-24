// -----------------------------------------------------------------------------
// Stars sotib olish va sotish uchun wizard scene'lar (boshqa miqdor kiritish).
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import { adminCancelKeyboard } from '../keyboards/adminKeyboards.js';
import { cancelKeyboard, confirmStarsKeyboard, mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { notifyAdmins } from '../services/notifyService.js';
import { isAdmin } from '../config/index.js';
import { SCENES, STARS_PRICES } from '../utils/constants.js';
import { formatMoney, displayName } from '../utils/helpers.js';

// ─── Stars SOTIB OLISH scene ──────────────────────────────────────────────────
export const starsBuyScene = new Scenes.WizardScene(
  SCENES.STARS_BUY,

  // Step 0: miqdor so'rash
  async (ctx) => {
    await ctx.reply(
      `⭐ <b>Stars sotib olish</b>\n\n` +
      `Narx: <b>1 Stars = ${STARS_PRICES.BUY_RATE.toLocaleString('ru-RU')} so'm</b>\n\n` +
      `Nechta Stars sotib olmoqchisiz? (raqam kiriting, masalan: 150)`,
      { parse_mode: 'HTML', ...cancelKeyboard() },
    );
    return ctx.wizard.next();
  },

  // Step 1: miqdorni tekshirish va tasdiqlash
  async (ctx) => {
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

    const totalPrice = amount * STARS_PRICES.BUY_RATE;
    ctx.wizard.state.amount = amount;

    await ctx.reply(
      `⭐ <b>Tasdiqlash</b>\n\n` +
      `Miqdor: <b>${amount} Stars</b>\n` +
      `To'lov: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `Davom etasizmi?`,
      { parse_mode: 'HTML', ...confirmStarsKeyboard('buy', amount) },
    );
    return ctx.scene.leave();
  },
);

// ─── Stars SOTISH scene ───────────────────────────────────────────────────────
export const starsSellScene = new Scenes.WizardScene(
  SCENES.STARS_SELL,

  // Step 0: miqdor so'rash
  async (ctx) => {
    await ctx.reply(
      `💰 <b>Stars sotish</b>\n\n` +
      `Narx: <b>1 Stars = ${STARS_PRICES.SELL_RATE.toLocaleString('ru-RU')} so'm</b>\n\n` +
      `Nechta Stars sotmoqchisiz? (raqam kiriting, masalan: 150)`,
      { parse_mode: 'HTML', ...cancelKeyboard() },
    );
    return ctx.wizard.next();
  },

  // Step 1: miqdorni tekshirish va tasdiqlash
  async (ctx) => {
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

    const totalPrice = amount * STARS_PRICES.SELL_RATE;
    ctx.wizard.state.amount = amount;

    await ctx.reply(
      `💰 <b>Tasdiqlash</b>\n\n` +
      `Miqdor: <b>${amount} Stars</b>\n` +
      `Olasiz: <b>${formatMoney(totalPrice)}</b>\n\n` +
      `Davom etasizmi?`,
      { parse_mode: 'HTML', ...confirmStarsKeyboard('sell', amount) },
    );
    return ctx.scene.leave();
  },
);

export default [starsBuyScene, starsSellScene];
