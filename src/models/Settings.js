// -----------------------------------------------------------------------------
// Settings model - a single document holding mutable runtime settings that
// admins can change without redeploying (e.g. toggling mandatory subscription).
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';

const { Schema } = mongoose;

const settingsSchema = new Schema(
  {
    // Singleton key so we always upsert the same document.
    key: { type: String, default: 'global', unique: true },

    subscriptionRequired: { type: Boolean, default: true },
    botEnabled: { type: Boolean, default: true },
    maintenanceMessage: {
      type: String,
      default: '🔧 Bot vaqtincha texnik ishlar tufayli to\'xtatilgan. Birozdan so\'ng qayting.',
    },

    // Overridable economy values (fall back to env config when null)
    referralBonus: { type: Number, default: null },
    minWithdrawal: { type: Number, default: null },
  },
  { timestamps: true },
);

/**
 * Fetch (and lazily create) the singleton settings document.
 * @returns {Promise<mongoose.Document>}
 */
settingsSchema.statics.getSettings = async function getSettings() {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) {
    doc = await this.create({ key: 'global' });
  }
  return doc;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
