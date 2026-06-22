// -----------------------------------------------------------------------------
// Referral view: shows the user's referral link and statistics.
// -----------------------------------------------------------------------------
import { buildReferralLink } from '../utils/helpers.js';
import messages from '../utils/messages.js';

/**
 * Show the referral dashboard.
 * @param {import('telegraf').Context} ctx
 */
export const showReferral = (ctx) => {
  const user = ctx.state.user;
  const link = buildReferralLink(user.telegramId);
  return ctx.reply(messages.referral(user, link), {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
};

export default showReferral;
