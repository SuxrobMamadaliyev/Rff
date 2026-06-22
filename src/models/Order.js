// -----------------------------------------------------------------------------
// Order model - a premium purchase request.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
import { ORDER_STATUS } from '../utils/constants.js';

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    telegramId: { type: Number, required: true, index: true },
    planKey: { type: String, required: true },
    planTitle: { type: String, required: true },
    months: { type: Number, required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // click / payme / uzum / stars / balance
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    // Set when an admin confirms/rejects the order
    handledBy: { type: Number, default: null },
    handledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
