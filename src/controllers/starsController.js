// -----------------------------------------------------------------------------
// /start + menu controller
// -----------------------------------------------------------------------------
import { isAdmin } from '../config/index.js';
import { Settings } from '../models/index.js';
import { checkSubscription } from '../services/subscriptionService.js';
import { setSubscribed } from '../services/userService.js';
import {
  mainMenuKeyboard,
  menuText,
  subscriptionKeyboard,
} from '../keyboards/userKeyboards.js';
import { displayName } from '../utils/helpers.js';
import messages from '../utils/messages.js';

const sendMainMenu = async (ctx, admin) => {
  const user = ctx.state.user;
  const name = user.firstName || displayName(user);
  try {
    await ctx.reply('👋', { reply_markup: { remove_keyboard: true } });
  } catch (_err) {}
  return ctx.reply(menuText(name), {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(admin),
  });
};

export const handleStart = async (ctx) => {
  const admin = isAdmin(ctx.from.id);
  const settings = await Settings.getSettings();

  // Faqat /start da majburiy obuna tekshiriladi
  if (!admin && settings.subscriptionRequired) {
    const { subscribed } = await checkSubscription(ctx.telegram, ctx.from.id);
    if (!subscribed) {
      await setSubscribed(ctx.from.id, false);
      return ctx.reply(messages.mustSubscribe, {
        parse_mode: 'HTML',
        ...subscriptionKeyboard(),
      });
    }
    await setSubscribed(ctx.from.id, true);
  }

  return sendMainMenu(ctx, admin);
};

// "✅ Tekshirish" tugmasi — tekshiruvsiz o'tkazadi
export const handleCheckSubscription = async (ctx) => {
  await ctx.answerCbQuery('✅ Tasdiqlandi!');
  try { await ctx.deleteMessage(); } catch (_err) {}
  return sendMainMenu(ctx, isAdmin(ctx.from.id));
};

export const showMainMenu = async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.state.user;
  const admin = isAdmin(ctx.from.id);
  const name = user.firstName || displayName(user);
  try {
    await ctx.editMessageText(menuText(name), {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(admin),
    });
  } catch (_err) {
    await ctx.reply(menuText(name), {
      parse_mode: 'HTML',
      ...mainMenuKeyboard(admin),
    });
  }
};

