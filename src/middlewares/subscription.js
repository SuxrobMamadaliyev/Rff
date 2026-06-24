// -----------------------------------------------------------------------------
// Mandatory subscription middleware.
// Blocks the bot until the user joins every required channel. Admins bypass it.
// The user can re-check via the "✅ Tekshirish" inline button which produces a
// callback query handled separately in the start controller.
// -----------------------------------------------------------------------------
import { isAdmin } from '../config/index.js';
import { Settings } from '../models/index.js';
import { checkSubscription } from '../services/subscriptionService.js';
import { setSubscribed } from '../services/userService.js';
import { subscriptionKeyboard } from '../keyboards/userKeyboards.js';
import messages from '../utils/messages.js';

/**
 * Telegraf middleware enforcing channel subscription.
 */
export const subscriptionGuard = () => async (ctx, next) => {
  // Adminlar hech qachon bloklanmaydi.
  if (isAdmin(ctx.from?.id)) return next();

  // MUHIM FIX: barcha callback query'larni o'tkazib yuboramiz.
  // Chunki foydalanuvchi allaqachon botdan foydalanayapti (tariflarni ko'ryapti),
  // callback'larni bloklash inline tugmalarni ishlamay qoldiradi.
  if (ctx.callbackQuery) return next();

  const settings = await Settings.getSettings();
  if (!settings.subscriptionRequired) return next();

  const { subscribed } = await checkSubscription(ctx.telegram, ctx.from.id);

  if (subscribed) {
    if (ctx.state.user && !ctx.state.user.isSubscribed) {
      await setSubscribed(ctx.from.id, true);
      ctx.state.user.isSubscribed = true;
    }
    return next();
  }

  // Obuna bo'lmagan: holatni keshlaymiz va kanal ro'yxatini ko'rsatamiz.
  if (ctx.state.user?.isSubscribed) {
    await setSubscribed(ctx.from.id, false);
  }

  try {
    await ctx.reply(messages.mustSubscribe, {
      parse_mode: 'HTML',
      ...subscriptionKeyboard(),
    });
  } catch (_err) {
    // ignore
  }

  return undefined;
};

export default subscriptionGuard;

