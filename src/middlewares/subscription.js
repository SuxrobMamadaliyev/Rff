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
import { ACTIONS } from '../utils/constants.js';
import messages from '../utils/messages.js';

/**
 * Telegraf middleware enforcing channel subscription.
 */
export const subscriptionGuard = () => async (ctx, next) => {
  // Admins are never gated.
  if (isAdmin(ctx.from?.id)) return next();

  // Always let the "check" callback through so the user can re-verify.
  if (ctx.callbackQuery?.data === ACTIONS.CHECK_SUBSCRIPTION) return next();

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

  // Not subscribed: cache the state and show the join prompt.
  if (ctx.state.user?.isSubscribed) {
    await setSubscribed(ctx.from.id, false);
  }

  try {
    await ctx.reply(messages.mustSubscribe, {
      parse_mode: 'HTML',
      ...subscriptionKeyboard(),
    });
  } catch (_err) {
    // ignore delivery failures
  }

  return undefined; // stop processing until subscribed
};

export default subscriptionGuard;
