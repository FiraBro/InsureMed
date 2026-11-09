import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planService } from "@/services/planService";

export const usePlans = () => {
  const queryClient = useQueryClient();

  // --------------------------
  // Public Queries
  // --------------------------
  const listPublic = (query = {}) =>
    useQuery({
      queryKey: ["plans", "public", query],
      queryFn: () => planService.listPlansPublic(query),
      keepPreviousData: true,
    });

  const popularPlans = () =>
    useQuery({
      queryKey: ["plans", "popular"],
      queryFn: planService.getPopularPlans,
    });

  const premiumStats = () =>
    useQuery({
      queryKey: ["plans", "premiumStats"],
      queryFn: planService.getPremiumStats,
    });

  const getPlanById = (id) =>
    useQuery({
      queryKey: ["plans", "id", id],
      queryFn: () => planService.getPlanById(id),
      enabled: !!id,
    });

  // --------------------------
  // AI Risk Score (with recommendations)
  // --------------------------
  const riskScore = (data) =>
    useQuery({
      queryKey: ["plans", "riskScore", data],
      queryFn: async () => {
        const res = await planService.riskScore(data);
        // return both score and recommendations
        return res.data; // { riskScore: number, recommendations: string[] }
      },
      enabled: false, // manual fetch with refetch
    });

  // --------------------------
  // Admin Mutations
  // --------------------------
  const createPlan = useMutation({
    mutationFn: planService.createPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, data }) => planService.updatePlan(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });

  const deletePlan = useMutation({
    mutationFn: planService.deletePlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });

  const listAdmin = (query = {}) =>
    useQuery({
      queryKey: ["plans", "admin", query],
      queryFn: () => planService.listPlansAdmin(query),
      keepPreviousData: true,
    });

  return {
    // Public
    listPublic,
    popularPlans,
    premiumStats,
    getPlanById,
    riskScore, // <-- now returns { riskScore, recommendations }

    // Admin
    listAdmin,
    createPlan,
    updatePlan,
    deletePlan,
  };
};
