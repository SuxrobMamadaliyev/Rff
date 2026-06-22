// -----------------------------------------------------------------------------
// Ticket wizard: collects one support message from the user and notifies admins.
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import { createTicket } from '../services/ticketService.js';
import { notifyAdmins } from '../services/notifyService.js';
import { ticketModerationKeyboard } from '../keyboards/adminKeyboards.js';
import { mainMenuKeyboard, cancelKeyboard } from '../keyboards/userKeyboards.js';
import { getUser } from '../services/userService.js';
import { SCENES } from '../utils/constants.js';
import messages from '../utils/messages.js';

const ticketScene = new Scenes.WizardScene(
  SCENES.TICKET,

  // Step 0: ask for the message.
  async (ctx) => {
    await ctx.reply(messages.ticketStart, { parse_mode: 'HTML', ...cancelKeyboard() });
    return ctx.wizard.next();
  },

  // Step 1: store the ticket and notify admins.
  async (ctx) => {
    const text = ctx.message?.text?.trim();
    if (!text) {
      await ctx.reply('✍️ Iltimos, matn ko\'rinishida yozing.', {
        parse_mode: 'HTML',
        ...cancelKeyboard(),
      });
      return undefined;
    }

    const ticket = await createTicket(ctx.from.id, text);
    const user = await getUser(ctx.from.id);

    await ctx.reply(messages.ticketCreated, { parse_mode: 'HTML', ...mainMenuKeyboard() });

    await notifyAdmins(
      ctx.telegram,
      messages.adminNewTicket(user, text),
      ticketModerationKeyboard(ticket._id.toString()),
    );

    return ctx.scene.leave();
  },
);

export default ticketScene;
