// -----------------------------------------------------------------------------
// Admin wizard scenes: balance add/sub, bonus, broadcast, forward, ban/unban
// and ticket replies. Each scene is short (1-2 steps) and admin-guarded by the
// router that enters it.
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

/**
 * Build a two-step "modify balance" wizard (add / subtract / bonus).
 * @param {string} sceneId
 * @param {{ sign:1|-1, type:string, verb:string }} options
 */
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

// ---- Broadcast (text advert) ----
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

// ---- Forward (copy any message) ----
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

// ---- Ban ----
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

// ---- Unban ----
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
      await ctx.reply(`✅ Foydalanuvchi (<code>${id}</code>) banи yechildi.`, {
        parse_mode: 'HTML',
        ...adminMenuKeyboard(),
      });
      await notifyUser(ctx.telegram, id, '✅ Sizning blokingiz yechildi. Botdan foydalanishingiz mumkin.');
    }
    return ctx.scene.leave();
  },
);

// ---- Reply to a ticket ----
const replyTicketSceneWizard = new Scenes.WizardScene(
  SCENES.ADMIN_REPLY_TICKET,
  async (ctx) => {
    // The ticketId is injected into scene.state by the entering handler.
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

export const adminScenes = [
  addBalanceScene,
  subBalanceScene,
  bonusScene,
  broadcastSceneWizard,
  forwardSceneWizard,
  banSceneWizard,
  unbanSceneWizard,
  replyTicketSceneWizard,
];

export default adminScenes;
