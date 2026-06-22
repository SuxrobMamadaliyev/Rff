// -----------------------------------------------------------------------------
// Application wide constants: button labels, callback action names and enums.
// Keeping labels here lets controllers, keyboards and routes stay in sync.
// -----------------------------------------------------------------------------

// Main reply keyboard button labels (also used to route text messages).
export const BUTTONS = {
  BUY_PREMIUM: '⭐ Premium sotib olish',
  PROFILE: '👤 Profil',
  REFERRAL: '👥 Referal',
  WITHDRAW: '💳 Pul yechish',
  CONTACT_ADMIN: '📞 Admin bilan bog\'lanish',
  CABINET: '🗄 Kabinet',
};

// Admin reply keyboard button labels.
export const ADMIN_BUTTONS = {
  STATS: '📊 Statistika',
  USERS: '👥 Foydalanuvchilar',
  ADD_BALANCE: '💰 Balans qo\'shish',
  SUB_BALANCE: '💸 Balans ayirish',
  BROADCAST: '📨 Reklama yuborish',
  FORWARD: '📢 Forward xabar yuborish',
  BONUS: '🎁 Bonus berish',
  BAN: '🚫 Ban',
  UNBAN: '✅ Unban',
  PAYMENTS: '📋 To\'lovlar',
  ORDERS: '📦 Buyurtmalar',
  SETTINGS: '⚙ Sozlamalar',
  EXIT: '⬅️ Chiqish',
};

// Inline callback action prefixes / names.
export const ACTIONS = {
  CHECK_SUBSCRIPTION: 'check_sub',
  BUY_PLAN: 'buy', // buy:<planKey>
  PAY_METHOD: 'pay', // pay:<planKey>:<method>
  PAY_STARS: 'stars', // stars:<planKey>
  CONFIRM_ORDER: 'order_ok', // order_ok:<orderId>
  REJECT_ORDER: 'order_no', // order_no:<orderId>
  CONFIRM_WITHDRAW: 'wd_ok', // wd_ok:<withdrawalId>
  REJECT_WITHDRAW: 'wd_no', // wd_no:<withdrawalId>
  REPLY_TICKET: 'ticket_reply', // ticket_reply:<ticketId>
  CLOSE_TICKET: 'ticket_close', // ticket_close:<ticketId>
  ADMIN_USER_INFO: 'usr', // usr:<telegramId>
  CANCEL: 'cancel',
};

// Payment methods.
export const PAYMENT_METHODS = {
  CLICK: 'click',
  PAYME: 'payme',
  UZUM: 'uzum',
  STARS: 'stars',
  BALANCE: 'balance',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CLICK]: 'Click',
  [PAYMENT_METHODS.PAYME]: 'Payme',
  [PAYMENT_METHODS.UZUM]: 'Uzum Bank',
  [PAYMENT_METHODS.STARS]: 'Telegram Stars',
  [PAYMENT_METHODS.BALANCE]: 'Balans',
};

// Status enums shared across models.
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const TICKET_STATUS = {
  OPEN: 'open',
  ANSWERED: 'answered',
  CLOSED: 'closed',
};

export const TRANSACTION_TYPE = {
  REFERRAL_BONUS: 'referral_bonus',
  ADMIN_ADD: 'admin_add',
  ADMIN_SUB: 'admin_sub',
  ADMIN_BONUS: 'admin_bonus',
  PURCHASE: 'purchase',
  WITHDRAWAL: 'withdrawal',
};

// Scene identifiers (Telegraf WizardScene names).
export const SCENES = {
  WITHDRAW: 'withdraw_scene',
  TICKET: 'ticket_scene',
  ADMIN_ADD_BALANCE: 'admin_add_balance_scene',
  ADMIN_SUB_BALANCE: 'admin_sub_balance_scene',
  ADMIN_BONUS: 'admin_bonus_scene',
  ADMIN_BROADCAST: 'admin_broadcast_scene',
  ADMIN_FORWARD: 'admin_forward_scene',
  ADMIN_BAN: 'admin_ban_scene',
  ADMIN_UNBAN: 'admin_unban_scene',
  ADMIN_REPLY_TICKET: 'admin_reply_ticket_scene',
};
