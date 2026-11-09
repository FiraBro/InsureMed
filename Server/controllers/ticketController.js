import * as TicketService from "../services/ticketService.js";

// 1. Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const ticket = await TicketService.createTicket({
      ...req.body,
      user: req.user.id,
      // The frontend can now send relatedPolicy or relatedClaim in the body
      relatedPolicy: req.body.relatedPolicy || null,
      relatedClaim: req.body.relatedClaim || null,
      messages: [{ sender: req.user.id, message: req.body.description }],
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// 2. Get list of tickets (Filtered by role)
export const getAllTickets = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;

    // 1. Role-based security filter
    let filters = req.user.role === "user" ? { user: req.user.id } : {};

    // 2. Add Status filter if provided (e.g., ?status=OPEN)
    if (status) {
      filters.status = status;
    }

    // 3. Call service with filters and pagination options
    const result = await TicketService.getAllTickets(filters, {
      page,
      limit,
      search,
    });
    console.log("Fetched Tickets:", result); // Debug log
    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status;

    // Call service with parameters
    const { tickets, total } = await TicketService.getUserTickets(req.user.id, {
      page,
      limit,
      search,
      status,
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page,
        pages: totalPages,
        total,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tickets: " + error.message,
    });
  }
};

// 3. Get single ticket details
export const getTicketDetails = async (req, res) => {
  try {
    const ticket = await TicketService.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Add a reply/message to a ticket
export const addReply = async (req, res) => {
  try {
    const { message } = req.body;
    const messageData = {
      sender: req.user.id,
      message: message,
    };

    const ticket = await TicketService.replyToTicket(
      req.params.id,
      messageData
    );
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. Update Status (Agent only)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await TicketService.updateStatus(req.params.id, status);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 6. Assign Ticket (Admin/Lead only)
export const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await TicketService.assignTicket(req.params.id, agentId);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
