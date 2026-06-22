// -----------------------------------------------------------------------------
// Entry point for the "💳 Pul yechish" flow (delegates to the wizard scene).
// -----------------------------------------------------------------------------
import { SCENES } from '../utils/constants.js';

/**
 * Enter the withdrawal wizard.
 * @param {import('telegraf').Context} ctx
 */
export const startWithdraw = (ctx) => ctx.scene.enter(SCENES.WITHDRAW);

export default startWithdraw;
