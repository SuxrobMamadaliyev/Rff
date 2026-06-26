// -----------------------------------------------------------------------------
// Referral view: shows the user's referral link and statistics.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import { buildReferralLink } from '../utils/helpers.js';
import messages from '../utils/messages.js';

/**
 * Show the referral dashboard.
 * @param {import('telegraf').Context} ctx
 */
export const showReferral = (ctx) => {
  const user = ctx.state.user;
  const link = buildReferralLink(user.telegramId);
  const shareText = "Bu botda men orqali ro'yxatdan o'tsang, sen ham bonus olasan! 🎁";
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;

  return ctx.reply(messages.referral(user, link), {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...Markup.inlineKeyboard([
      Markup.button.url('📤 Ulashish', shareUrl),
    ]),
  });
};

export default showReferral;

