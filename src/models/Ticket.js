// -----------------------------------------------------------------------------
// Ticket model - support conversation between a user and the admins.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
import { TICKET_STATUS } from '../utils/constants.js';

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    from: { type: String, enum: ['user', 'admin'], required: true },
    authorId: { type: Number, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ticketSchema = new Schema(
  {
    telegramId: { type: Number, required: true, index: true },
    subject: { type: String, default: 'Murojaat' },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
      index: true,
    },
    messages: { type: [messageSchema], default: [] },
    handledBy: { type: Number, default: null },
  },
  { timestamps: true },
);

ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
