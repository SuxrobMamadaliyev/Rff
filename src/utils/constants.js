// -----------------------------------------------------------------------------
// Application wide constants — TO'LIQ VERSIYA.
// Stars sotish/sotib olish action'lari qo'shildi.
// -----------------------------------------------------------------------------

export const BUTTONS = {
  BUY_PREMIUM: '⭐ Premium sotib olish',
  BUY_STARS: '⭐ Stars sotib olish',
  SELL_STARS: '💰 Stars sotish',
  REFERRAL: '👥 Referal',
  WITHDRAW: '💳 Pul yechish',
  CONTACT_ADMIN: '📞 Admin bilan bog\'lanish',
  CABINET: '🗄 Kabinet',
  ADMIN_PANEL: '🛠 Admin panel',
};

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

export const ACTIONS = {
  CHECK_SUBSCRIPTION: 'check_sub',
  BUY_PLAN: 'buy',
  PAY_METHOD: 'pay',
  PAY_STARS: 'stars',
  CONFIRM_ORDER: 'order_ok',
  REJECT_ORDER: 'order_no',
  CONFIRM_WITHDRAW: 'wd_ok',
  REJECT_WITHDRAW: 'wd_no',
  REPLY_TICKET: 'ticket_reply',
  CLOSE_TICKET: 'ticket_close',
  ADMIN_USER_INFO: 'usr',
  CANCEL: 'cancel',
  // Cabinet inline actions
  CABINET_PROFILE: 'cabinet:profile',
  CABINET_REFERRAL: 'cabinet:referral',
  CABINET_ORDERS: 'cabinet:orders',
  CABINET_PAYMENTS: 'cabinet:payments',
  CABINET_WITHDRAWALS: 'cabinet:withdrawals',
  CABINET_WITHDRAW: 'cabinet:withdraw',
  // Stars actions
  BUY_STARS_AMOUNT: 'stars_buy',
  BUY_STARS_CUSTOM: 'stars_buy_custom',
  SELL_STARS_AMOUNT: 'stars_sell',
  SELL_STARS_CUSTOM: 'stars_sell_custom',
  CONFIRM_STARS: 'stars_confirm',
};

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
  STARS_BUY: 'stars_buy',
  STARS_SELL: 'stars_sell',
  WITHDRAWAL: 'withdrawal',
};

export const SCENES = {
  WITHDRAW: 'withdraw_scene',
  TICKET: 'ticket_scene',
  STARS_BUY: 'stars_buy_scene',
  STARS_SELL: 'stars_sell_scene',
  ADMIN_ADD_BALANCE: 'admin_add_balance_scene',
  ADMIN_SUB_BALANCE: 'admin_sub_balance_scene',
  ADMIN_BONUS: 'admin_bonus_scene',
  ADMIN_BROADCAST: 'admin_broadcast_scene',
  ADMIN_FORWARD: 'admin_forward_scene',
  ADMIN_BAN: 'admin_ban_scene',
  ADMIN_UNBAN: 'admin_unban_scene',
  ADMIN_REPLY_TICKET: 'admin_reply_ticket_scene',
};

export const STARS_PRICES = {
  // 1 Stars = necha so'm (sotib olish narxi — foydalanuvchi to'laydi)
  BUY_RATE: 130,
  // 1 Stars = necha so'm (sotish narxi — foydalanuvchi oladi)
  SELL_RATE: 110,
};


