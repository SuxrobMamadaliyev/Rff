// -----------------------------------------------------------------------------
// Payment model - a ledger of every balance movement and purchase payment.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
import { PAYMENT_STATUS, TRANSACTION_TYPE } from '../utils/constants.js';

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    telegramId: { type: Number, required: true, index: true },
    amount: { type: Number, required: true },
    // positive = credit (balance up), negative = debit (balance down)
    direction: { type: String, enum: ['credit', 'debit'], required: true },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true,
    },
    method: { type: String, default: null }, // click / payme / uzum / stars / balance
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CONFIRMED,
    },
    description: { type: String, default: '' },
    // Optional link to a related document (order/withdrawal)
    refId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true },
);

paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
