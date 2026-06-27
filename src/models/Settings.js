// -----------------------------------------------------------------------------
// Settings model - a single document holding mutable runtime settings that
// admins can change without redeploying.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';

const { Schema } = mongoose;

const planPriceSchema = new Schema(
  {
    key: { type: String, required: true }, // '3m', '6m', '12m'
    price: { type: Number, default: null }, // so'm narxi (null = .env fallback)
    stars: { type: Number, default: null }, // Stars narxi (null = .env fallback)
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true },

    subscriptionRequired: { type: Boolean, default: true },
    botEnabled: { type: Boolean, default: true },
    maintenanceMessage: {
      type: String,
      default: "🔧 Bot vaqtincha texnik ishlar tufayli to'xtatilgan. Birozdan so'ng qayting.",
    },

    // Overridable economy values
    referralBonus: { type: Number, default: null },
    minWithdrawal: { type: Number, default: null },

    // Admin karta ma'lumotlari (null = .env fallback)
    cardNumber: { type: String, default: null },
    cardHolder: { type: String, default: null },

    // Stars kurs (null = constants fallback)
    starsBuyRate: { type: Number, default: null },  // 1 star = X so'm (sotib olish)
    starsSellRate: { type: Number, default: null }, // 1 star = X so'm (sotish)

    // Plan narxlari override
    planPrices: { type: [planPriceSchema], default: [] },
  },
  { timestamps: true },
);

settingsSchema.statics.getSettings = async function getSettings() {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) {
    doc = await this.create({ key: 'global' });
  }
  return doc;
};

/**
 * Berilgan plan uchun so'm va stars narxini qaytaradi (override yoki fallback).
 */
settingsSchema.statics.getPlanPrice = async function getPlanPrice(planKey, fallbackPlan) {
  const settings = await this.getSettings();
  const override = settings.planPrices.find((p) => p.key === planKey);
  return {
    price: override?.price ?? fallbackPlan.price,
    stars: override?.stars ?? fallbackPlan.stars,
  };
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
