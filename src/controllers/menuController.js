// -----------------------------------------------------------------------------
// Main menu helpers (re-show the keyboard, fallback for unknown text).
// -----------------------------------------------------------------------------
import { mainMenuKeyboard } from '../keyboards/userKeyboards.js';
import messages from '../utils/messages.js';

/**
 * Re-display the main menu.
 * @param {import('telegraf').Context} ctx
 */
export const showMainMenu = (ctx) =>
  ctx.reply(messages.mainMenu, { parse_mode: 'HTML', ...mainMenuKeyboard() });

/**
 * Fallback for unrecognized text outside of any scene.
 * @param {import('telegraf').Context} ctx
 */
export const handleUnknown = (ctx) =>
  ctx.reply(messages.unknownCommand, { parse_mode: 'HTML', ...mainMenuKeyboard() });
