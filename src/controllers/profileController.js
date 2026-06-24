// -----------------------------------------------------------------------------
// Profile view.
// -----------------------------------------------------------------------------
import messages from '../utils/messages.js';

/**
 * Show the user's profile card.
 * @param {import('telegraf').Context} ctx
 */
export const showProfile = (ctx) => {
  const user = ctx.state.user;
  return ctx.reply(messages.profile(user), { parse_mode: 'HTML' });
};

export default showProfile;

