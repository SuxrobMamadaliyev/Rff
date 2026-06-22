// -----------------------------------------------------------------------------
// Support ticket business logic.
// -----------------------------------------------------------------------------
import { Ticket } from '../models/index.js';
import { TICKET_STATUS } from '../utils/constants.js';

/**
 * Open a ticket (or append to the user's latest open one) with the first message.
 * @param {number} telegramId
 * @param {string} text
 * @returns {Promise<import('mongoose').Document>}
 */
export const createTicket = async (telegramId, text) => {
  let ticket = await Ticket.findOne({
    telegramId,
    status: { $in: [TICKET_STATUS.OPEN, TICKET_STATUS.ANSWERED] },
  }).sort({ createdAt: -1 });

  if (!ticket) {
    ticket = new Ticket({ telegramId, status: TICKET_STATUS.OPEN, messages: [] });
  } else {
    ticket.status = TICKET_STATUS.OPEN;
  }

  ticket.messages.push({ from: 'user', authorId: telegramId, text });
  await ticket.save();
  return ticket;
};

/**
 * Append an admin reply to a ticket and mark it answered.
 * @param {string} ticketId
 * @param {number} adminId
 * @param {string} text
 * @returns {Promise<import('mongoose').Document|null>}
 */
export const replyToTicket = async (ticketId, adminId, text) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return null;

  ticket.messages.push({ from: 'admin', authorId: adminId, text });
  ticket.status = TICKET_STATUS.ANSWERED;
  ticket.handledBy = adminId;
  await ticket.save();
  return ticket;
};

/**
 * Close a ticket.
 * @param {string} ticketId
 * @param {number} adminId
 * @returns {Promise<import('mongoose').Document|null>}
 */
export const closeTicket = async (ticketId, adminId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return null;
  ticket.status = TICKET_STATUS.CLOSED;
  ticket.handledBy = adminId;
  await ticket.save();
  return ticket;
};

export default { createTicket, replyToTicket, closeTicket };
