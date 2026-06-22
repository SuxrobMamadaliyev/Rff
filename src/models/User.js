// -----------------------------------------------------------------------------
// User model - one document per Telegram user.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    telegramId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    username: { type: String, default: null, trim: true },
    firstName: { type: String, default: null, trim: true },
    lastName: { type: String, default: null, trim: true },
    languageCode: { type: String, default: 'uz' },

    balance: { type: Number, default: 0, min: 0 },

    // Referral data
    referredBy: { type: Number, default: null, index: true }, // inviter telegramId
    referralCount: { type: Number, default: 0, min: 0 },
    referralEarnings: { type: Number, default: 0, min: 0 },

    purchasedCount: { type: Number, default: 0, min: 0 },

    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isSubscribed: { type: Boolean, default: false },

    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.index({ createdAt: -1 });

/**
 * Convenience method returning a safe plain object for templates.
 */
userSchema.methods.toView = function toView() {
  return {
    telegramId: this.telegramId,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    balance: this.balance,
    referralCount: this.referralCount,
    referralEarnings: this.referralEarnings,
    purchasedCount: this.purchasedCount,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
