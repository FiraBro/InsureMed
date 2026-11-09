import api from "@/lib/axios";

export const adminService = {
  // Fetches the deep facet aggregation (Profitability, Funnel, Retention, Risk)
  getEnterpriseData: async () => {
    const response = await api.get("/admin/analytics/financials");
    return response.data.data;
  },

  // Fetches system-wide settings
  getSettings: async () => {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  // Updates global configurations (Tax, System Name, etc.)
  updateSettings: async (settingsData) => {
    const response = await api.patch("/admin/settings", settingsData);
    return response.data;
  },
  globalSearch: async (query) => {
    try {
      const response = await api.get(`/admin/global/search?q=${query}`);
      // Return the data directly for the hook to consume
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Search API Error:", error);
      throw error;
    }
  },
};
