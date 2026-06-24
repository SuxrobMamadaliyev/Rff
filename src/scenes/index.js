// -----------------------------------------------------------------------------
// Assemble all wizard scenes into a Telegraf Stage.
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

export const buildStage = () => {
  const stage = new Scenes.Stage([withdrawScene, ticketScene, ...adminScenes]);

  stage.action(ACTIONS.CANCEL, async (ctx) => {
    await ctx.answerCbQuery('Bekor qilindi');
    try { await ctx.deleteMessage(); } catch (_err) {}
    const admin = isAdmin(ctx.from.id);
    const keyboard = admin ? adminMenuKeyboard() : mainMenuKeyboard(false);
    await ctx.reply(messages.cancelled, { parse_mode: 'HTML', ...keyboard });
    return ctx.scene.leave();
  });

  stage.command('cancel', async (ctx) => {
    const admin = isAdmin(ctx.from.id);
    const keyboard = admin ? adminMenuKeyboard() : mainMenuKeyboard(false);
    await ctx.reply(messages.cancelled, { parse_mode: 'HTML', ...keyboard });
    return ctx.scene.leave();
  });

  return stage;
};

export default buildStage;

