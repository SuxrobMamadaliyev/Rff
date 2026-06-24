// -----------------------------------------------------------------------------
// Withdrawal wizard: collects a card number + amount, then creates a request.
// -----------------------------------------------------------------------------
import { Scenes } from 'telegraf';
import { createWithdrawal } from '../services/withdrawalService.js';
import { notifyAdmins } from '../services/notifyService.js';
import { withdrawalModerationKeyboard } from '../keyboards/adminKeyboards.js';
import { mainMenuKeyboard, cancelKeyboard } from '../keyboards/userKeyboards.js';
import { getUser } from '../services/userService.js';
import config from '../config/index.js';
import { Settings } from '../models/index.js';
import { SCENES } from '../utils/constants.js';
import messages from '../utils/messages.js';

// Accept 8-19 digits (spaces/dashes allowed) to cover Uzum (8-digit) and 16-digit cards.
const CARD_REGEX = /^[0-9 -]{8,23}$/;

/**
 * Normalize a card number to digits-only form for storage.
 * @param {string} raw
 * @returns {string}
 */
const normalizeCard = (raw) => raw.replace(/[^0-9]/g, '');

const withdrawScene = new Scenes.WizardScene(
  SCENES.WITHDRAW,

  // Step 0: ask for the card number.
  async (ctx) => {
    const user = ctx.state.user || (await getUser(ctx.from.id));
    const settings = await Settings.getSettings();
    const minWithdrawal = settings.minWithdrawal ?? config.economy.minWithdrawal;

    if (user.balance < minWithdrawal) {
      await ctx.reply(
        `❌ Balansingiz yetarli emas. Minimal yechish: <b>${minWithdrawal.toLocaleString('ru-RU')} ${config.economy.currency}</b>.`,
        { parse_mode: 'HTML', ...mainMenuKeyboard() },
      );
      return ctx.scene.leave();
    }

    await ctx.reply(messages.withdrawStart(user.balance), {
      parse_mode: 'HTML',
      ...cancelKeyboard(),
    });
    return ctx.wizard.next();
  },

  // Step 1: validate card, ask for the amount.
  async (ctx) => {
    const text = ctx.message?.text?.trim();
    if (!text || !CARD_REGEX.test(text)) {
      await ctx.reply(messages.withdrawInvalidCard, { parse_mode: 'HTML', ...cancelKeyboard() });
      return undefined;
    }

    const normalized = normalizeCard(text);
    if (normalized.length < 8 || normalized.length > 19) {
      await ctx.reply(messages.withdrawInvalidCard, { parse_mode: 'HTML', ...cancelKeyboard() });
      return undefined;
    }

    ctx.wizard.state.cardNumber = normalized;
    await ctx.reply(messages.withdrawAskAmount, { parse_mode: 'HTML', ...cancelKeyboard() });
    return ctx.wizard.next();
  },

  // Step 2: validate amount, create the request.
  async (ctx) => {
    const text = ctx.message?.text?.trim();
    const amount = Number(text);

    if (!text || !Number.isFinite(amount) || amount <= 0) {
      await ctx.reply(messages.withdrawInvalidAmount, { parse_mode: 'HTML', ...cancelKeyboard() });
      return undefined;
    }

    const user = await getUser(ctx.from.id);
    const settings = await Settings.getSettings();
    const minWithdrawal = settings.minWithdrawal ?? config.economy.minWithdrawal;

    if (amount < minWithdrawal) {
      await ctx.reply(
        `❌ Minimal yechish summasi: <b>${minWithdrawal.toLocaleString('ru-RU')} ${config.economy.currency}</b>. Qaytadan kiriting:`,
        { parse_mode: 'HTML', ...cancelKeyboard() },
      );
      return undefined;
    }
    if (amount > user.balance) {
      await ctx.reply(messages.withdrawTooMuch(user.balance), {
        parse_mode: 'HTML',
        ...cancelKeyboard(),
      });
      return undefined;
    }

    const withdrawal = await createWithdrawal(ctx.from.id, ctx.wizard.state.cardNumber, amount);

    await ctx.reply(messages.withdrawCreated, { parse_mode: 'HTML', ...mainMenuKeyboard() });

    await notifyAdmins(
      ctx.telegram,
      messages.adminNewWithdrawal(user, withdrawal),
      withdrawalModerationKeyboard(withdrawal._id.toString()),
    );

    return ctx.scene.leave();
  },
);

export default withdrawScene;

