// -----------------------------------------------------------------------------
// Anti-spam middleware: blocks identical messages sent in rapid succession and
// debounces double taps on the same inline button.
// -----------------------------------------------------------------------------
const lastMessage = new Map(); // Map<userId, { text, at }>

const DUPLICATE_WINDOW_MS = 1500;

/**
 * Telegraf middleware dropping duplicate consecutive messages.
 */
export const antiSpam = () => async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId) return next();

  // Only guard text messages and callback queries.
  const signature =
    ctx.message?.text ?? (ctx.callbackQuery ? `cb:${ctx.callbackQuery.data}` : null);

  if (signature == null) return next();

  const now = Date.now();
  const prev = lastMessage.get(userId);
  lastMessage.set(userId, { text: signature, at: now });

  if (prev && prev.text === signature && now - prev.at < DUPLICATE_WINDOW_MS) {
    // Silently acknowledge callback queries so the client stops spinning.
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCbQuery();
      } catch (_err) {
        // ignore
      }
    }
    return undefined; // drop duplicate
  }

  return next();
};

export default antiSpam;
