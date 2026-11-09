import Ticket from "../models/ticket.js";
import VALID_TRANSITIONS from "../constants/transition.js";
import sendEmail from "../utils/sendEmail.js";
import { ticketStatusUpdateEmail } from "../utils/emailTemplate.js";
import getDeadline from "../utils/getDeadline.js";

export const createTicket = (data) =>
  Ticket.create({ ...data, slaDeadline: getDeadline(data.priority) });

// Updated Service with true pagination and search
export const getUserTickets = async (
  userId,
  { page = 1, limit = 10, search = "" }
) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build dynamic filter
  const query = { user: userId };

  // Add search functionality (searches subject or category)
  if (search) {
    query.$or = [
      { subject: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  // 1. Get total count for pagination metadata
  const total = await Ticket.countDocuments(query);

  // 2. Get the specific "chunk" of data
  const tickets = await Ticket.find(query)
    .sort({ updatedAt: -1 }) // Show recently updated first
    .skip(skip)
    .limit(parseInt(limit));

  return { tickets, total };
};

// Phase 6: Updated getAllTickets to show Insurance Context
export const getAllTickets = async (filters = {}, options = {}) => {
  const { page = 1, limit = 10, search = "" } = options;

  // Calculate how many documents to skip
  const skip = (page - 1) * limit;

  // Add search logic if a search string exists
  let finalFilters = { ...filters };
  if (search) {
    finalFilters.$or = [
      { subject: { $regex: search, $options: "i" } },
      { ticketId: { $regex: search, $options: "i" } },
    ];
  }

  // Execute queries in parallel for better performance
  const [tickets, total] = await Promise.all([
    Ticket.find(finalFilters)
      .populate("user", "name email")
      .populate("assignedTo", "name")
      .populate({ path: "relatedPolicy", select: "policyNumber type status" })
      .populate({ path: "relatedClaim", select: "claimNumber amount status" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Ticket.countDocuments(finalFilters),
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
    },
  };
};

export const getTicketById = (id) =>
  Ticket.findById(id).populate("user assignedTo");

export const replyToTicket = async (ticketId, messageData) => {
  console.log("Replying to ticket:", ticketId, messageData);
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new Error("Ticket not found");
  if (ticket.status === "CLOSED") throw new Error("Ticket is closed");

  ticket.messages.push(messageData);
  return await ticket.save();
};

export const updateStatus = async (ticketId, newStatus) => {
  // 1. Find ticket and populate user info to get their email
  const ticket = await Ticket.findById(ticketId).populate("user");
  if (!ticket) throw new Error("Ticket not found");

  // 2. Validate transition (The logic we built in Phase 5)
  if (!VALID_TRANSITIONS[ticket.status].includes(newStatus)) {
    throw new Error(`Invalid transition from ${ticket.status} to ${newStatus}`);
  }

  // 3. Update status
  ticket.status = newStatus;
  await ticket.save();

  // 4. Send Email Notification
  try {
    const emailData = ticketStatusUpdateEmail(
      ticket.user.name,
      ticket.ticketId,
      newStatus,
      `${process.env.CLIENT_UR}/support/tickets/${ticket._id}` // Your Frontend URL
    );

    await sendEmail({
      email: ticket.user.email,
      ...emailData,
    });
  } catch (err) {
    console.error("Email failed to send, but ticket was updated:", err);
    // We don't throw an error here because the DB update was successful
  }

  return ticket;
};

export const assignAgent = (ticketId, agentId) =>
  Ticket.findByIdAndUpdate(
    ticketId,
    { assignedTo: agentId, status: "IN_REVIEW" },
    { new: true }
  );
