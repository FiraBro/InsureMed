import api from "@/lib/axios";

export const ticketService = {
  // Create a new support request
  createTicket: async (ticketData) => {
    const response = await api.post("/support/tickets", ticketData);
    return response.data;
  },

  // Get ALL tickets (Admin/Agent View)
  getAllTickets: async (params = {}) => {
    const response = await api.get("/support/tickets", { params });
    // Ensure we return the array directly or handle the nested data object
    console.log("Response from getAllTickets:", response);
    return response;
  },

  // Get tickets for the logged-in user
  getMyTickets: async (params = {}) => {
    const response = await api.get("/support/tickets/my-tickets", { params });
    console.log("Response from getMyTickets:", response);
    return response.data;
  },

  // Get a single ticket with full message history
  getTicketDetails: async (id) => {
    if (!id) return null;
    const response = await api.get(`/support/tickets/${id}`);
    return response.data;
  },

  // FIXED: Added sender parameter so backend knows who is talking
  replyToTicket: async (id, message, sender = "USER") => {
    const response = await api.post(`/support/tickets/${id}/messages`, {
      message,
      sender, // This is CRITICAL for Admin live chat to show bubbles correctly
    });
    return response.data;
  },

  // (Admin/Agent) Update status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/support/tickets/${id}/status`, {
      status,
    });
    return response.data;
  },
};
