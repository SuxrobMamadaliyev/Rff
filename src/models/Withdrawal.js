// -----------------------------------------------------------------------------
// Withdrawal model - a user request to cash out balance to a card.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
import { WITHDRAWAL_STATUS } from '../utils/constants.js';

const { Schema } = mongoose;

const withdrawalSchema = new Schema(
  {
    telegramId: { type: Number, required: true, index: true },
    cardNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(WITHDRAWAL_STATUS),
      default: WITHDRAWAL_STATUS.PENDING,
      index: true,
    },
    handledBy: { type: Number, default: null },
    handledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

withdrawalSchema.index({ createdAt: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
