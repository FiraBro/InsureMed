import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "@/services/dashboardService";
export const useDashboard = () => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboardOverview,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000, // Data stays fresh for 10 seconds
    retry: 2, // Retry twice if request fails
  });
};
