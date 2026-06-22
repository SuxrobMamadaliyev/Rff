// -----------------------------------------------------------------------------
// Admin: view & toggle runtime settings.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import { Settings } from '../../models/index.js';
import config from '../../config/index.js';
import { formatMoney } from '../../utils/helpers.js';

/**
 * Build the settings inline keyboard reflecting current toggles.
 * @param {import('mongoose').Document} settings
 */
const settingsKeyboard = (settings) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `Majburiy obuna: ${settings.subscriptionRequired ? '✅ Yoniq' : '❌ O\'chiq'}`,
        'settings:toggle_sub',
      ),
    ],
    [
      Markup.button.callback(
        `Bot holati: ${settings.botEnabled ? '✅ Faol' : '🔧 Texnik ishlar'}`,
        'settings:toggle_bot',
      ),
    ],
  ]);

/**
 * Render the settings screen.
 * @param {import('telegraf').Context} ctx
 */
export const showSettings = async (ctx) => {
  const settings = await Settings.getSettings();
  const text =
    `⚙ <b>Sozlamalar</b>\n\n` +
    `🔒 Majburiy obuna: <b>${settings.subscriptionRequired ? 'Yoniq' : 'O\'chiq'}</b>\n` +
    `🤖 Bot holati: <b>${settings.botEnabled ? 'Faol' : 'Texnik ishlar'}</b>\n` +
    `🎁 Referal bonus: <b>${formatMoney(settings.referralBonus ?? config.economy.referralBonus)}</b>\n` +
    `💸 Minimal yechish: <b>${formatMoney(settings.minWithdrawal ?? config.economy.minWithdrawal)}</b>`;

  return ctx.reply(text, { parse_mode: 'HTML', ...settingsKeyboard(settings) });
};

/**
 * Toggle the mandatory subscription flag.
 * @param {import('telegraf').Context} ctx
 */
export const toggleSubscription = async (ctx) => {
  const settings = await Settings.getSettings();
  settings.subscriptionRequired = !settings.subscriptionRequired;
  await settings.save();
  await ctx.answerCbQuery(`Majburiy obuna: ${settings.subscriptionRequired ? 'yoniq' : 'o\'chiq'}`);
  return ctx.editMessageReplyMarkup(settingsKeyboard(settings).reply_markup);
};

/**
 * Toggle the bot enabled flag (maintenance mode).
 * @param {import('telegraf').Context} ctx
 */
export const toggleBot = async (ctx) => {
  const settings = await Settings.getSettings();
  settings.botEnabled = !settings.botEnabled;
  await settings.save();
  await ctx.answerCbQuery(`Bot: ${settings.botEnabled ? 'faol' : 'texnik ishlar'}`);
  return ctx.editMessageReplyMarkup(settingsKeyboard(settings).reply_markup);
};
