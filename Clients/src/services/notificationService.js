import api from "@/lib/axios";
export const notificationApi = {
  // Fetch all notifications with optional filters
  getNotifications: async (params) => {
    const { data } = await api.get("/notifications", { params });
    console.log("data fetch:", data);
    return data; // Expected: { success: true, data: [...], unreadCount: 5 }
  },

  // Mark a single notification as read
  markAsRead: async (id) => {
    const { data } = await api.patch(`/${id}/read`);
    return data;
  },

  // Mark all notifications as read
  markAllRead: async () => {
    const { data } = await api.patch("/mark-all-read");
    return data;
  },

  // Delete a notification
  deleteNotification: async (id) => {
    const { data } = await api.delete(`/${id}`);
    return data;
  },
};
