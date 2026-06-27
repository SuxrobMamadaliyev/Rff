// -----------------------------------------------------------------------------
// Application wide constants
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
  PRICES: '💲 Narxlar',
  CARD_INFO: '💳 Karta ma\'lumotlari',
  EXIT: '⬅️ Chiqish',
};

export const ACTIONS = {
  // Menu
  MENU: 'menu',
  MENU_PREMIUM: 'menu:premium',
  MENU_BUY_STARS: 'menu:buy_stars',
  MENU_SELL_STARS: 'menu:sell_stars',
  MENU_REFERRAL: 'menu:referral',
  MENU_WITHDRAW: 'menu:withdraw',
  MENU_CABINET: 'menu:cabinet',
  MENU_CONTACT: 'menu:contact',
  MENU_ADMIN: 'menu:admin',
  // Subscription
  CHECK_SUBSCRIPTION: 'check_sub',
  // Premium
  BUY_PLAN: 'buy',
  PAY_METHOD: 'pay',
  PAY_STARS: 'stars',
  // Admin karta
  PAY_CARD: 'pay_card',
  CARD_SENT_CHECK: 'card_check',
  // Admin moderation
  CONFIRM_ORDER: 'order_ok',
  REJECT_ORDER: 'order_no',
  CONFIRM_WITHDRAW: 'wd_ok',
  REJECT_WITHDRAW: 'wd_no',
  REPLY_TICKET: 'ticket_reply',
  CLOSE_TICKET: 'ticket_close',
  ADMIN_USER_INFO: 'usr',
  CANCEL: 'cancel',
  // Cabinet
  CABINET_PROFILE: 'cabinet:profile',
  CABINET_REFERRAL: 'cabinet:referral',
  CABINET_ORDERS: 'cabinet:orders',
  CABINET_PAYMENTS: 'cabinet:payments',
  CABINET_WITHDRAWALS: 'cabinet:withdrawals',
  CABINET_WITHDRAW: 'cabinet:withdraw',
  // Stars
  BUY_STARS_AMOUNT: 'stars_buy',
  BUY_STARS_CUSTOM: 'stars_buy_custom',
  SELL_STARS_AMOUNT: 'stars_sell',
  SELL_STARS_CUSTOM: 'stars_sell_custom',
  CONFIRM_STARS: 'stars_confirm',
  // Admin narx o'zgartirish
  PRICE_EDIT_PLAN: 'price_edit',
  PRICE_EDIT_STARS_RATE: 'price_stars_rate',
};

export const PAYMENT_METHODS = {
  STARS: 'stars',
  CARD: 'card',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.STARS]: 'Telegram Stars',
  [PAYMENT_METHODS.CARD]: 'Admin kartasi',
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
  CARD_CHECK_SCENE: 'card_check_scene',
  SELL_STARS_CARD_SCENE: 'sell_stars_card_scene',
  // Yangi narx/karta scene'lari
  ADMIN_EDIT_PLAN_PRICE: 'admin_edit_plan_price_scene',
  ADMIN_EDIT_STARS_RATE: 'admin_edit_stars_rate_scene',
  ADMIN_EDIT_CARD: 'admin_edit_card_scene',
  ADMIN_EDIT_REFERRAL_BONUS: 'admin_edit_referral_bonus_scene',
  ADMIN_EDIT_MIN_WITHDRAWAL: 'admin_edit_min_withdrawal_scene',
};

export const STARS_PRICES = {
  BUY_RATE: 130,
  SELL_RATE: 110,
};
