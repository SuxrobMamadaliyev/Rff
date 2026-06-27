// -----------------------------------------------------------------------------
// Admin wizard scenes: balance add/sub, bonus, broadcast, forward, ban/unban,
// ticket replies, narx/karta o'zgartirish.
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import { getUser, adjustBalance, setBanned } from '../services/userService.js';
import { replyToTicket } from '../services/ticketService.js';
import { broadcastText, broadcastForward } from '../services/broadcastService.js';
import { notifyUser } from '../services/notifyService.js';
import { adminMenuKeyboard, adminCancelKeyboard } from '../keyboards/adminKeyboards.js';
import { parseTelegramId, formatMoney } from '../utils/helpers.js';
import { SCENES, TRANSACTION_TYPE } from '../utils/constants.js';
import messages from '../utils/messages.js';
import { Settings } from '../models/index.js';
import config from '../config/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Balans wizardlari
// ─────────────────────────────────────────────────────────────────────────────
const balanceScene = (sceneId, { sign, type, verb }) =>
  new Scenes.WizardScene(
    sceneId,
    async (ctx) => {
      await ctx.reply(`👤 Foydalanuvchi Telegram ID raqamini yuboring:`, adminCancelKeyboard());
      return ctx.wizard.next();
    },
    async (ctx) => {
      const id = parseTelegramId(ctx.message?.text);
      if (!id) {
        await ctx.reply('❌ Noto\'g\'ri ID. Raqam yuboring:', adminCancelKeyboard());
        return undefined;
      }
      const target = await getUser(id);
      if (!target) {
        await ctx.reply('❌ Bunday foydalanuvchi topilmadi. Boshqa ID yuboring:', adminCancelKeyboard());
        return undefined;
      }
      ctx.wizard.state.targetId = id;
      await ctx.reply(`💰 Summani kiriting (joriy balans: ${formatMoney(target.balance)}):`, adminCancelKeyboard());
      return ctx.wizard.next();
    },
    async (ctx) => {
      const amount = Number(ctx.message?.text);
      if (!Number.isFinite(amount) || amount <= 0) {
        await ctx.reply('❌ Summa noto\'g\'ri. Musbat raqam yuboring:', adminCancelKeyboard());
        return undefined;
      }

      const id = ctx.wizard.state.targetId;
      try {
        const user = await adjustBalance(id, sign * amount, type, {
          description: `Admin ${verb}: ${formatMoney(amount)}`,
        });
        await ctx.reply(
          `✅ Bajarildi. Foydalanuvchi (<code>${id}</code>) yangi balansi: <b>${formatMoney(user.balance)}</b>`,
          { parse_mode: 'HTML', ...adminMenuKeyboard() },
        );

        const verbText =
          sign > 0
            ? `Hisobingizga <b>${formatMoney(amount)}</b> qo'shildi 🎉`
            : `Hisobingizdan <b>${formatMoney(amount)}</b> yechib olindi.`;
        await notifyUser(ctx.telegram, id, `💼 ${verbText}\nYangi balans: <b>${formatMoney(user.balance)}</b>`);
      } catch (err) {
        if (err.message === 'INSUFFICIENT_BALANCE') {
          await ctx.reply('❌ Foydalanuvchi balansi yetarli emas.', adminMenuKeyboard());
        } else {
          throw err;
        }
      }
      return ctx.scene.leave();
    },
  );

const addBalanceScene = balanceScene(SCENES.ADMIN_ADD_BALANCE, {
  sign: 1,
  type: TRANSACTION_TYPE.ADMIN_ADD,
  verb: 'qo\'shdi',
});

const subBalanceScene = balanceScene(SCENES.ADMIN_SUB_BALANCE, {
  sign: -1,
  type: TRANSACTION_TYPE.ADMIN_SUB,
  verb: 'ayirdi',
});

const bonusScene = balanceScene(SCENES.ADMIN_BONUS, {
  sign: 1,
  type: TRANSACTION_TYPE.ADMIN_BONUS,
  verb: 'bonus berdi',
});

// ─────────────────────────────────────────────────────────────────────────────
// Broadcast
// ─────────────────────────────────────────────────────────────────────────────
const broadcastSceneWizard = new Scenes.WizardScene(
  SCENES.ADMIN_BROADCAST,
  async (ctx) => {
    await ctx.reply('📨 Reklama matnini yuboring (HTML qo\'llab-quvvatlanadi):', adminCancelKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const text = ctx.message?.text;
    if (!text) {
      await ctx.reply('❌ Matn yuboring:', adminCancelKeyboard());
      return undefined;
    }
    await ctx.reply('📤 Yuborilmoqda...');
    const { total, sent, failed } = await broadcastText(ctx.telegram, text);
    await ctx.reply(
      `✅ Reklama yuborildi.\n\n👥 Jami: ${total}\n✅ Yetkazildi: ${sent}\n❌ Xatolik: ${failed}`,
      adminMenuKeyboard(),
    );
    return ctx.scene.leave();
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Forward
// ─────────────────────────────────────────────────────────────────────────────
const forwardSceneWizard = new Scenes.WizardScene(
  SCENES.ADMIN_FORWARD,
  async (ctx) => {
    await ctx.reply('📢 Yubormoqchi bo\'lgan xabaringizni (rasm/video/matn) shu yerga tashlang:', adminCancelKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message) {
      await ctx.reply('❌ Xabar topilmadi. Qaytadan yuboring:', adminCancelKeyboard());
      return undefined;
    }
    await ctx.reply('📤 Yuborilmoqda...');
    const { total, sent, failed } = await broadcastForward(
      ctx.telegram,
      ctx.chat.id,
      ctx.message.message_id,
    );
    await ctx.reply(
      `✅ Xabar yuborildi.\n\n👥 Jami: ${total}\n✅ Yetkazildi: ${sent}\n❌ Xatolik: ${failed}`,
      adminMenuKeyboard(),
    );
    return ctx.scene.leave();
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Ban / Unban
// ─────────────────────────────────────────────────────────────────────────────
const banSceneWizard = new Scenes.WizardScene(
  SCENES.ADMIN_BAN,
  async (ctx) => {
    await ctx.reply('🚫 Ban qilinadigan foydalanuvchi ID raqamini yuboring:', adminCancelKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const id = parseTelegramId(ctx.message?.text);
    if (!id) {
      await ctx.reply('❌ Noto\'g\'ri ID. Raqam yuboring:', adminCancelKeyboard());
      return undefined;
    }
    const user = await setBanned(id, true);
    if (!user) {
      await ctx.reply('❌ Foydalanuvchi topilmadi.', adminMenuKeyboard());
    } else {
      await ctx.reply(`🚫 Foydalanuvchi (<code>${id}</code>) ban qilindi.`, {
        parse_mode: 'HTML',
        ...adminMenuKeyboard(),
      });
      await notifyUser(ctx.telegram, id, messages.banned);
    }
    return ctx.scene.leave();
  },
);

const unbanSceneWizard = new Scenes.WizardScene(
  SCENES.ADMIN_UNBAN,
  async (ctx) => {
    await ctx.reply('✅ Ban yechiladigan foydalanuvchi ID raqamini yuboring:', adminCancelKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const id = parseTelegramId(ctx.message?.text);
    if (!id) {
      await ctx.reply('❌ Noto\'g\'ri ID. Raqam yuboring:', adminCancelKeyboard());
      return undefined;
    }
    const user = await setBanned(id, false);
    if (!user) {
      await ctx.reply('❌ Foydalanuvchi topilmadi.', adminMenuKeyboard());
    } else {
      await ctx.reply(`✅ Foydalanuvchi (<code>${id}</code>) bani yechildi.`, {
        parse_mode: 'HTML',
        ...adminMenuKeyboard(),
      });
      await notifyUser(ctx.telegram, id, '✅ Sizning blokingiz yechildi. Botdan foydalanishingiz mumkin.');
    }
    return ctx.scene.leave();
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Ticket reply
// ─────────────────────────────────────────────────────────────────────────────
const replyTicketSceneWizard = new Scenes.WizardScene(
  SCENES.ADMIN_REPLY_TICKET,
  async (ctx) => {
    if (!ctx.scene.state.ticketId) {
      await ctx.reply('❌ Ticket aniqlanmadi.', adminMenuKeyboard());
      return ctx.scene.leave();
    }
    await ctx.reply('✍️ Javobingizni yozing:', adminCancelKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const text = ctx.message?.text;
    if (!text) {
      await ctx.reply('❌ Matn yuboring:', adminCancelKeyboard());
      return undefined;
    }
    const ticketId = ctx.scene.state.ticketId;
    const ticket = await replyToTicket(ticketId, ctx.from.id, text);
    if (!ticket) {
      await ctx.reply('❌ Ticket topilmadi.', adminMenuKeyboard());
      return ctx.scene.leave();
    }

    const delivered = await notifyUser(ctx.telegram, ticket.telegramId, messages.ticketAdminReply(text));
    await ctx.reply(
      delivered ? '✅ Javob foydalanuvchiga yuborildi.' : '⚠️ Javob saqlandi, lekin foydalanuvchiga yetib bormadi.',
      adminMenuKeyboard(),
    );
    return ctx.scene.leave();
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// NARX O'ZGARTIRISH — Plan (so'm + stars)
// ─────────────────────────────────────────────────────────────────────────────
const editPlanPriceScene = new Scenes.WizardScene(
  SCENES.ADMIN_EDIT_PLAN_PRICE,
  async (ctx) => {
    const planKey = ctx.scene.state.planKey;
    const plan = config.plans.find((p) => p.key === planKey);
    if (!plan) {
      await ctx.reply('❌ Tarif topilmadi.', adminMenuKeyboard());
      return ctx.scene.leave();
    }
    const settings = await Settings.getSettings();
    const override = settings.planPrices?.find((p) => p.key === planKey);
    const currentPrice = override?.price ?? plan.price;

    ctx.wizard.state.planKey = planKey;
    ctx.wizard.state.plan = plan;

    await ctx.reply(
      `💲 <b>${plan.title}</b> — so'm narxi\n\nJoriy narx: <b>${currentPrice.toLocaleString('ru-RU')} so'm</b>\n\nYangi narxni kiriting:`,
      { parse_mode: 'HTML', ...adminCancelKeyboard() },
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const price = Number(ctx.message?.text?.replace(/\s/g, ''));
    if (!Number.isFinite(price) || price <= 0) {
      await ctx.reply('❌ Noto\'g\'ri narx. Musbat raqam kiriting:', adminCancelKeyboard());
      return undefined;
    }
    ctx.wizard.state.newPrice = price;

    const settings = await Settings.getSettings();
    const override = settings.planPrices?.find((p) => p.key === ctx.wizard.state.planKey);
    const currentStars = override?.stars ?? ctx.wizard.state.plan.stars;

    await ctx.reply(
      `⭐ Stars miqdori\n\nJoriy: <b>${currentStars}⭐</b>\n\nYangi Stars miqdorini kiriting (0 = Stars to'lovi o'chiriladi):`,
      { parse_mode: 'HTML', ...adminCancelKeyboard() },
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const stars = Number(ctx.message?.text?.trim());
    if (!Number.isFinite(stars) || stars < 0) {
      await ctx.reply('❌ Noto\'g\'ri miqdor. 0 yoki musbat raqam kiriting:', adminCancelKeyboard());
      return undefined;
    }

    const { planKey, newPrice, plan } = ctx.wizard.state;
    const settings = await Settings.getSettings();

    const idx = settings.planPrices?.findIndex((p) => p.key === planKey);
    if (idx >= 0) {
      settings.planPrices[idx].price = newPrice;
      settings.planPrices[idx].stars = stars;
    } else {
      settings.planPrices.push({ key: planKey, price: newPrice, stars });
    }
    settings.markModified('planPrices');
    await settings.save();

    await ctx.reply(
      `✅ <b>${plan.title}</b> narxi yangilandi!\n\n💰 So'm: <b>${newPrice.toLocaleString('ru-RU')} so'm</b>\n⭐ Stars: <b>${stars}⭐</b>`,
      { parse_mode: 'HTML', ...adminMenuKeyboard() },
    );
    return ctx.scene.leave();
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// STARS KURS O'ZGARTIRISH
// ─────────────────────────────────────────────────────────────────────────────
const editStarsRateScene = new Scenes.WizardScene(
  SCENES.ADMIN_EDIT_STARS_RATE,
  async (ctx) => {
    const rateType = ctx.scene.state.rateType; // 'buy' | 'sell'
    ctx.wizard.state.rateType = rateType;

    const settings = await Settings.getSettings();
    const currentRate = rateType === 'buy'
      ? (settings.starsBuyRate ?? 130)
      : (settings.starsSellRate ?? 110);
    const label = rateType === 'buy' ? 'sotib olish' : 'sotish';

    await ctx.reply(
      `⭐ Stars <b>${label}</b> kursi\n\nJoriy: <b>1⭐ = ${currentRate.toLocaleString('ru-RU')} so'm</b>\n\nYangi kursni kiriting (so'm):`,
      { parse_mode: 'HTML', ...adminCancelKeyboard() },
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const rate = Number(ctx.message?.text?.replace(/\s/g, ''));
    if (!Number.isFinite(rate) || rate <= 0) {
      await ctx.reply('❌ Noto\'g\'ri kurs. Musbat raqam kiriting:', adminCancelKeyboard());
      return undefined;
    }

    const { rateType } = ctx.wizard.state;
    const settings = await Settings.getSettings();
    if (rateType === 'buy') {
      settings.starsBuyRate = rate;
    } else {
      settings.starsSellRate = rate;
    }
    await settings.save();

    const label = rateType === 'buy' ? 'Sotib olish' : 'Sotish';
    await ctx.reply(
      `✅ ${label} kursi yangilandi!\n\n⭐ <b>1⭐ = ${rate.toLocaleString('ru-RU')} so'm</b>`,
      { parse_mode: 'HTML', ...adminMenuKeyboard() },
    );
    return ctx.scene.leave();
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// KARTA MA'LUMOTLARI O'ZGARTIRISH
// ─────────────────────────────────────────────────────────────────────────────
const editCardScene = new Scenes.WizardScene(
  SCENES.ADMIN_EDIT_CARD,
  async (ctx) => {
    const field = ctx.scene.state.field; // 'number' | 'holder'
    ctx.wizard.state.field = field;

    const settings = await Settings.getSettings();
    const label = field === 'number' ? 'Karta raqami' : 'Karta egasi';
    const current = field === 'number'
      ? (settings.cardNumber ?? config.payments.cardNumber)
      : (settings.cardHolder ?? config.payments.cardHolder);

    await ctx.reply(
      `💳 <b>${label}</b>\n\nJoriy: <code>${current}</code>\n\nYangi qiymatni kiriting:`,
      { parse_mode: 'HTML', ...adminCancelKeyboard() },
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const value = ctx.message?.text?.trim();
    if (!value) {
      await ctx.reply('❌ Bo\'sh qiymat. Qaytadan kiriting:', adminCancelKeyboard());
      return undefined;
    }

    const { field } = ctx.wizard.state;
    const settings = await Settings.getSettings();
    if (field === 'number') {
      settings.cardNumber = value;
    } else {
      settings.cardHolder = value;
    }
    await settings.save();

    const label = field === 'number' ? 'Karta raqami' : 'Karta egasi';
    await ctx.reply(
      `✅ ${label} yangilandi!\n\n<code>${value}</code>`,
      { parse_mode: 'HTML', ...adminMenuKeyboard() },
    );
    return ctx.scene.leave();
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export const adminScenes = [
  addBalanceScene,
  subBalanceScene,
  bonusScene,
  broadcastSceneWizard,
  forwardSceneWizard,
  banSceneWizard,
  unbanSceneWizard,
  replyTicketSceneWizard,
  editPlanPriceScene,
  editStarsRateScene,
  editCardScene,
];

export default adminScenes;
