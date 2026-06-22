// -----------------------------------------------------------------------------
// Admin panel entry: opening / closing the panel and entering admin scenes.
// -----------------------------------------------------------------------------
import { adminMenuKeyboard } from '../../keyboards/adminKeyboards.js';
import { mainMenuKeyboard } from '../../keyboards/userKeyboards.js';
import { SCENES } from '../../utils/constants.js';

/**
 * Open the admin panel (reply keyboard).
 * @param {import('telegraf').Context} ctx
 */
export const openPanel = (ctx) =>
  ctx.reply('🛠 <b>Admin panel</b>\n\nKerakli amalni tanlang 👇', {
    parse_mode: 'HTML',
    ...adminMenuKeyboard(),
  });

/**
 * Leave the admin panel and return to the user menu.
 * @param {import('telegraf').Context} ctx
 */
export const exitPanel = (ctx) =>
  ctx.reply('⬅️ Asosiy menyuga qaytdingiz.', {
    parse_mode: 'HTML',
    ...mainMenuKeyboard(),
  });

// Each admin keyboard button simply enters the relevant wizard scene.
export const enterAddBalance = (ctx) => ctx.scene.enter(SCENES.ADMIN_ADD_BALANCE);
export const enterSubBalance = (ctx) => ctx.scene.enter(SCENES.ADMIN_SUB_BALANCE);
export const enterBonus = (ctx) => ctx.scene.enter(SCENES.ADMIN_BONUS);
export const enterBroadcast = (ctx) => ctx.scene.enter(SCENES.ADMIN_BROADCAST);
export const enterForward = (ctx) => ctx.scene.enter(SCENES.ADMIN_FORWARD);
export const enterBan = (ctx) => ctx.scene.enter(SCENES.ADMIN_BAN);
export const enterUnban = (ctx) => ctx.scene.enter(SCENES.ADMIN_UNBAN);
