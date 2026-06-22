// -----------------------------------------------------------------------------
// Admin middleware: guards admin-only handlers.
// Use `requireAdmin` to wrap a single handler, or `adminOnly` as a guard inside
// composed routers.
// -----------------------------------------------------------------------------
import { isAdmin } from '../config/index.js';

/**
 * Guard middleware: continues only when the sender is an admin.
 */
export const adminOnly = () => async (ctx, next) => {
  if (!isAdmin(ctx.from?.id)) {
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCbQuery('⛔️ Ruxsat yo\'q', { show_alert: true });
      } catch (_err) {
        // ignore
      }
    }
    return undefined;
  }
  return next();
};

/**
 * Wrap a handler so it only runs for admins (silently ignores others).
 * @param {(ctx:import('telegraf').Context)=>Promise<unknown>} handler
 */
export const requireAdmin = (handler) => async (ctx) => {
  if (!isAdmin(ctx.from?.id)) return undefined;
  return handler(ctx);
};

export default adminOnly;
