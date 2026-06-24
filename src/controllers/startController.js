// -----------------------------------------------------------------------------
// /start command + subscription re-check callback.
// -----------------------------------------------------------------------------
import { isAdmin } from '../config/index.js';
import { Settings } from '../models/index.js';
import { checkSubscription } from '../services/subscriptionService.js';
import { setSubscribed } from '../services/userService.js';
import { mainMenuKeyboard, subscriptionKeyboard } from '../keyboards/userKeyboards.js';
import { displayName } from '../utils/helpers.js';
import messages from '../utils/messages.js';

export const handleStart = async (ctx) => {
  const user = ctx.state.user;
  const admin = isAdmin(ctx.from.id);
  const settings = await Settings.getSettings();

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

  return ctx.reply(messages.welcome(user.firstName || displayName(user)), {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(admin),
  });
};

export const handleCheckSubscription = async (ctx) => {
  const { subscribed } = await checkSubscription(ctx.telegram, ctx.from.id);

  if (!subscribed) {
    await ctx.answerCbQuery('❗️ Hali obuna bo\'lmadingiz', { show_alert: true });
    return undefined;
  }

  await setSubscribed(ctx.from.id, true);
  await ctx.answerCbQuery('✅ Obuna tasdiqlandi!');

  try {
    await ctx.deleteMessage();
  } catch (_err) {}

  return ctx.reply(messages.subscribed, {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(isAdmin(ctx.from.id)),
  });
};

