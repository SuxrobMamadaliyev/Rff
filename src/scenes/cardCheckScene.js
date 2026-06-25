// -----------------------------------------------------------------------------
// cardCheckScene — foydalanuvchi "Tashladim" bossandan keyin chek (rasm/hujjat)
// so'raladi, admin tasdiqlash uchun xabar oladi.
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import { Markup } from 'telegraf';
import { createOrder } from '../services/orderService.js';
import { notifyAdmins } from '../services/notifyService.js';
import { orderModerationKeyboard } from '../keyboards/adminKeyboards.js';
import { mainMenuKeyboard, cancelKeyboard } from '../keyboards/userKeyboards.js';
import { PAYMENT_METHODS, SCENES } from '../utils/constants.js';
import { isAdmin } from '../config/index.js';
import { escapeHtml, displayName, formatMoney } from '../utils/helpers.js';
import messages from '../utils/messages.js';
import logger from '../utils/logger.js';

const cardCheckScene = new Scenes.BaseScene(SCENES.CARD_CHECK_SCENE);

cardCheckScene.enter(async (ctx) => {
  const { plan } = ctx.scene.state;
  await ctx.reply(
    `📸 <b>Chek yuborish</b>\n\n` +
    `⭐ Tarif: <b>${escapeHtml(plan.title)}</b>\n` +
    `💰 Summa: <b>${formatMoney(plan.price)}</b>\n\n` +
    `Iltimos, to'lov chekini (screenshot) rasm yoki fayl ko'rinishida yuboring:`,
    {
      parse_mode: 'HTML',
      ...cancelKeyboard(),
    },
  );
});

// Rasm chek
cardCheckScene.on('photo', async (ctx) => {
  await handleCheckReceived(ctx, 'photo');
});

// Hujjat chek
cardCheckScene.on('document', async (ctx) => {
  await handleCheckReceived(ctx, 'document');
});

// Matn kelsa
cardCheckScene.on('text', async (ctx) => {
  await ctx.reply(
    '❗ Iltimos, chekni <b>rasm</b> yoki <b>fayl</b> ko\'rinishida yuboring.',
    { parse_mode: 'HTML', ...cancelKeyboard() },
  );
});

async function handleCheckReceived(ctx, type) {
  const { planKey, plan } = ctx.scene.state;
  const user = ctx.state.user;

  try {
    // Order yaratish
    const order = await createOrder(ctx.from.id, plan, PAYMENT_METHODS.CARD);

    // Foydalanuvchiga xabar
    await ctx.reply(
      `✅ Chekingiz qabul qilindi!\n\n` +
      `⭐ Tarif: <b>${escapeHtml(plan.title)}</b>\n` +
      `💰 Summa: <b>${formatMoney(plan.price)}</b>\n\n` +
      `Admin chekni tekshirib, buyurtmani tasdiqlaydi. Tez orada xabar olasiz! 🙏`,
      {
        parse_mode: 'HTML',
        ...mainMenuKeyboard(isAdmin(ctx.from.id)),
      },
    );

    // Admin xabari — avval matn
    const adminText =
      `💳 <b>Yangi to'lov — Admin kartasi</b>\n\n` +
      `👤 Foydalanuvchi: ${displayName(user)} (<code>${user.telegramId}</code>)\n` +
      `⭐ Tarif: <b>${escapeHtml(plan.title)}</b>\n` +
      `💰 Summa: <b>${formatMoney(plan.price)}</b>\n` +
      `🆔 Buyurtma: <code>${order._id}</code>\n\n` +
      `📸 Chek quyida ↓`;

    await notifyAdmins(ctx.telegram, adminText, orderModerationKeyboard(order._id.toString()));

    // Chekni adminga forward qilish
    try {
      if (type === 'photo') {
        const photo = ctx.message.photo;
        const fileId = photo[photo.length - 1].file_id;
        const caption = ctx.message.caption || '';
        // Barcha adminlarga chekni yuborish
        const { adminIds } = (await import('../config/index.js')).default || {};
        // notifyAdmins orqali rasm yuboramiz — notifyService ichida
        await notifyAdminPhoto(ctx.telegram, fileId, caption, order._id.toString());
      } else {
        const fileId = ctx.message.document.file_id;
        const caption = ctx.message.caption || '';
        await notifyAdminDocument(ctx.telegram, fileId, caption, order._id.toString());
      }
    } catch (forwardErr) {
      logger.warn(`Chek forward xatosi: ${forwardErr.message}`);
    }

  } catch (err) {
    logger.error(`Card check scene error: ${err.message}`);
    await ctx.reply(messages.error, { parse_mode: 'HTML' });
  }

  return ctx.scene.leave();
}

// Admin rasm yuborish yordamchi funksiyalar
async function notifyAdminPhoto(telegram, fileId, caption, orderId) {
  const config = (await import('../config/index.js')).default;
  for (const adminId of config.adminIds) {
    try {
      await telegram.sendPhoto(adminId, fileId, {
        caption: caption ? `📸 Chek | Buyurtma: ${orderId}\n${caption}` : `📸 Chek | Buyurtma: ${orderId}`,
        parse_mode: 'HTML',
      });
    } catch (err) {
      // ignore per-admin errors
    }
  }
}

async function notifyAdminDocument(telegram, fileId, caption, orderId) {
  const config = (await import('../config/index.js')).default;
  for (const adminId of config.adminIds) {
    try {
      await telegram.sendDocument(adminId, fileId, {
        caption: caption ? `📄 Chek fayl | Buyurtma: ${orderId}\n${caption}` : `📄 Chek fayl | Buyurtma: ${orderId}`,
        parse_mode: 'HTML',
      });
    } catch (err) {
      // ignore per-admin errors
    }
  }
}

export default cardCheckScene;
