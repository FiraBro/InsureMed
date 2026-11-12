import api from "@/lib/axios";

export const fetchUserDashboard = async () => {
  const response = await api.get("/dashboard");
  const payload = response?.data;
  return payload?.data ?? payload;
};

export const fetchDashboardOverview = async () => {
  const response = await api.get("/dashboard/admin/overview");
  const payload = response?.data?.data ?? response?.data ?? {};
  const stats = payload?.stats ?? payload?.summary ?? {};

  return {
    ...payload,
    stats: {
      totalRevenue: stats?.totalRevenue ?? 0,
      activePolicies: stats?.activePolicies ?? 0,
      pendingApplications: stats?.pendingApplications ?? 0,
      totalUsers: stats?.totalUsers ?? 0,
    },
    monthlyGrowth: Array.isArray(payload?.monthlyGrowth) ? payload.monthlyGrowth : [],
    recentActivity: Array.isArray(payload?.recentActivity) ? payload.recentActivity : [],
  };
};
