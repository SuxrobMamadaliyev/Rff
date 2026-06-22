// -----------------------------------------------------------------------------
// Entry point for the "📞 Admin bilan bog'lanish" flow (ticket wizard).
// -----------------------------------------------------------------------------
import { SCENES } from '../utils/constants.js';

/**
 * Enter the ticket wizard.
 * @param {import('telegraf').Context} ctx
 */
export const startTicket = (ctx) => ctx.scene.enter(SCENES.TICKET);

export default startTicket;
