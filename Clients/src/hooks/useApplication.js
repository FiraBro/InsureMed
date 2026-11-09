import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService } from "@/services/applicationService";
import { toast } from "react-toastify";

/**
 * Senior-level hook for managing applications.
 * Handles both User (My Applications) and Admin views with server-side pagination.
 */
export const useApplications = (filters = {}) => {
  const queryClient = useQueryClient();

  // --- 1️⃣ Query: My Applications (User View) ---
  // Key structure: resource -> scope -> specific filter state
  const myApplicationsQuery = useQuery({
    queryKey: ["applications", "me", filters],
    queryFn: () => applicationService.getMyApplications(filters),
    staleTime: 30000,
    placeholderData: (prev) => prev, // Keeps UI stable while paginating
  });

  // --- 2️⃣ Query: All Applications (Admin View) ---
  const adminApplicationsQuery = useQuery({
    queryKey: ["applications", "admin", filters],
    queryFn: () => applicationService.listApplications(filters),
    enabled: !!filters.isAdmin,
    placeholderData: (prev) => prev,
  });

  // --- 3️⃣ Helper: Global Cache Invalidation ---
  // Calling this clears both Admin and User caches simultaneously
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  // --- 4️⃣ Mutations ---
  const applyMutation = useMutation({
    mutationFn: (formData) => applicationService.applyForPolicy(formData),
    onSuccess: () => {
      invalidateAll();
      toast.success("Application submitted successfully!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Apply failed"),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => applicationService.approveApplication(id),
    onSuccess: () => {
      invalidateAll();
      // Also clear policies as a new one was likely created
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Application approved");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => applicationService.rejectApplication(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Application rejected");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => applicationService.deleteApplication(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Application deleted");
    },
  });

  // --- 5️⃣ Return Object (Structured for UI) ---
  return {
    // Data - Safely pulling from User or Admin queries
    apps: myApplicationsQuery.data?.applications || [],
    adminApplications: adminApplicationsQuery.data?.applications || [],

    // UI Helpers
    counts: myApplicationsQuery.data?.counts || {
      all: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },

    // Pagination Metadata (Unified across User/Admin)
    meta: {
      total:
        adminApplicationsQuery.data?.total ||
        myApplicationsQuery.data?.pagination?.total ||
        0,
      totalPages:
        adminApplicationsQuery.data?.totalPages ||
        myApplicationsQuery.data?.pagination?.totalPages ||
        1,
      currentPage:
        adminApplicationsQuery.data?.page ||
        myApplicationsQuery.data?.pagination?.page ||
        1,
    },

    // Status States
    isLoading:
      myApplicationsQuery.isLoading || adminApplicationsQuery.isLoading,
    isFetching:
      myApplicationsQuery.isFetching || adminApplicationsQuery.isFetching,
    isProcessing:
      approveMutation.isPending ||
      rejectMutation.isPending ||
      deleteMutation.isPending ||
      applyMutation.isPending,
    error: myApplicationsQuery.error || adminApplicationsQuery.error,

    // Actions
    actions: {
      apply: applyMutation.mutateAsync,
      approve: approveMutation.mutateAsync,
      reject: rejectMutation.mutateAsync,
      remove: deleteMutation.mutateAsync,
      refresh: invalidateAll,
    },
  };
};
