// -----------------------------------------------------------------------------
// Main menu helpers.
// -----------------------------------------------------------------------------
import { isAdmin } from '../config/index.js';
import { mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import messages from '../utils/messages.js';

export const showMainMenu = (ctx) =>
  ctx.reply(messages.mainMenu, {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(isAdmin(ctx.from?.id)),
  });

export const handleUnknown = (ctx) =>
  ctx.reply(messages.unknownCommand, {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(isAdmin(ctx.from?.id)),
  });

