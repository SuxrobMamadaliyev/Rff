// -----------------------------------------------------------------------------
// Reply & inline keyboards shown to administrators.
// -----------------------------------------------------------------------------
import { Markup } from 'telegraf';
import { ADMIN_BUTTONS, ACTIONS } from '../utils/constants.js';

export const adminMenuKeyboard = () =>
  Markup.keyboard([
    [ADMIN_BUTTONS.STATS, ADMIN_BUTTONS.USERS],
    [ADMIN_BUTTONS.ADD_BALANCE, ADMIN_BUTTONS.SUB_BALANCE],
    [ADMIN_BUTTONS.BONUS, ADMIN_BUTTONS.BROADCAST],
    [ADMIN_BUTTONS.FORWARD, ADMIN_BUTTONS.BAN],
    [ADMIN_BUTTONS.UNBAN, ADMIN_BUTTONS.PAYMENTS],
    [ADMIN_BUTTONS.ORDERS, ADMIN_BUTTONS.SETTINGS],
    [ADMIN_BUTTONS.PRICES, ADMIN_BUTTONS.CARD_INFO],
    [ADMIN_BUTTONS.EXIT],
  ]).resize();

export const orderModerationKeyboard = (orderId) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Tasdiqlash', `${ACTIONS.CONFIRM_ORDER}:${orderId}`),
      Markup.button.callback('❌ Rad etish', `${ACTIONS.REJECT_ORDER}:${orderId}`),
    ],
  ]);

export const withdrawalModerationKeyboard = (withdrawalId) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Tasdiqlash', `${ACTIONS.CONFIRM_WITHDRAW}:${withdrawalId}`),
      Markup.button.callback('❌ Rad etish', `${ACTIONS.REJECT_WITHDRAW}:${withdrawalId}`),
    ],
  ]);

export const ticketModerationKeyboard = (ticketId) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('✍️ Javob berish', `${ACTIONS.REPLY_TICKET}:${ticketId}`),
      Markup.button.callback('🔒 Yopish', `${ACTIONS.CLOSE_TICKET}:${ticketId}`),
    ],
  ]);

export const adminCancelKeyboard = () =>
  Markup.inlineKeyboard([[Markup.button.callback('❌ Bekor qilish', ACTIONS.CANCEL)]]);
