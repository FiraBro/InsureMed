import api from "@/lib/axios";

export const fetchDashboardOverview = async () => {
  const { data } = await api.get("/dashboard/admin/overview");
  return data.data; // Returning the 'data' object from your Postman response
};
