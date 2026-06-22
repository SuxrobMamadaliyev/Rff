// -----------------------------------------------------------------------------
// Referral model - records each successful referral relationship + bonus paid.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';

const { Schema } = mongoose;

const referralSchema = new Schema(
  {
    // The user who invited (received the bonus)
    referrerId: { type: Number, required: true, index: true },
    // The newly joined user
    referredId: { type: Number, required: true, unique: true, index: true },
    bonus: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
