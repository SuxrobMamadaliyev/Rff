// -----------------------------------------------------------------------------
// Mandatory subscription middleware — TO'LIQ TUZATILGAN.
// Faqat text xabarlarni bloklaydigan, callback query va pre_checkout'ni
// to'liq o'tkazib yuboradigan versiya.
// -----------------------------------------------------------------------------
import { isAdmin } from '../config/index.js';
import { Settings } from '../models/index.js';
import { checkSubscription } from '../services/subscriptionService.js';
import { setSubscribed } from '../services/userService.js';
import { subscriptionKeyboard } from '../keyboards/userKeyboards.js';
import messages from '../utils/messages.js';

export const subscriptionGuard = () => async (ctx, next) => {
  // 1. Adminlar hech qachon bloklanmaydi
  if (isAdmin(ctx.from?.id)) return next();

  // 2. Barcha callback_query (inline tugmalar) — to'siqsiz o'tadi
  //    Chunki foydalanuvchi allaqachon botda, inline tugmalarni bloklash
  //    butun flow'ni sindiradi
  if (ctx.callbackQuery) return next();

  // 3. Stars to'lovi lifecycle — hech qachon bloklanmaydi
  if (ctx.preCheckoutQuery) return next();
  if (ctx.message?.successful_payment) return next();

  // 4. Subscription o'chirilgan bo'lsa — o'tkazamiz
  const settings = await Settings.getSettings();
  if (!settings.subscriptionRequired) return next();

  // 5. Faqat oddiy text/command xabarlarda tekshiruv
  const { subscribed } = await checkSubscription(ctx.telegram, ctx.from.id);

  if (subscribed) {
    if (ctx.state.user && !ctx.state.user.isSubscribed) {
      await setSubscribed(ctx.from.id, true);
      ctx.state.user.isSubscribed = true;
    }
    return next();
  }

  // Obuna bo'lmagan foydalanuvchi
  if (ctx.state.user?.isSubscribed) {
    await setSubscribed(ctx.from.id, false);
    ctx.state.user.isSubscribed = false;
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


