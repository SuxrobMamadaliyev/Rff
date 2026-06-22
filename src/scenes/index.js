// -----------------------------------------------------------------------------
// Assemble all wizard scenes into a Telegraf Stage and add a shared cancel
// handler so the "❌ Bekor qilish" button works inside any scene.
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import withdrawScene from './withdrawScene.js';
import ticketScene from './ticketScene.js';
import adminScenes from './adminScenes.js';
import { adminMenuKeyboard } from '../keyboards/adminKeyboards.js';
import { mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import { isAdmin } from '../config/index.js';
import { ACTIONS } from '../utils/constants.js';
import messages from '../utils/messages.js';

/**
 * Build the configured Stage middleware.
 * @returns {Scenes.Stage}
 */
export const buildStage = () => {
  const stage = new Scenes.Stage([withdrawScene, ticketScene, ...adminScenes]);

  // Shared cancel handler available in every scene.
  stage.action(ACTIONS.CANCEL, async (ctx) => {
    await ctx.answerCbQuery('Bekor qilindi');
    try {
      await ctx.deleteMessage();
    } catch (_err) {
      // ignore
    }
    const keyboard = isAdmin(ctx.from.id) ? adminMenuKeyboard() : mainMenuKeyboard();
    await ctx.reply(messages.cancelled, { parse_mode: 'HTML', ...keyboard });
    return ctx.scene.leave();
  });

  // /cancel command also leaves any active scene.
  stage.command('cancel', async (ctx) => {
    const keyboard = isAdmin(ctx.from.id) ? adminMenuKeyboard() : mainMenuKeyboard();
    await ctx.reply(messages.cancelled, { parse_mode: 'HTML', ...keyboard });
    return ctx.scene.leave();
  });

  return stage;
};

export default buildStage;
