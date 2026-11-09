import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { claimService } from "@/services/claimService";
import { toast } from "react-toastify";

export const useClaims = (filters = {}) => {
  const queryClient = useQueryClient();

  // 1️⃣ Query: My Personal Claims (User Side)
  const myClaimsQuery = useQuery({
    queryKey: ["claims-me", filters],
    // Change this line:
    queryFn: () => claimService.getMyClaims(filters),
    staleTime: 30000,
  });

  // This will still log undefined on the very first frame
  // because the network request is asynchronous.
  console.log("data", myClaimsQuery.data?.data);
  // 2️⃣ Query: All Claims (Admin Side)
  const adminClaimsQuery = useQuery({
    queryKey: ["claims-admin", filters],
    queryFn: () => claimService.listAllClaims(filters),
    placeholderData: (prev) => prev,
    enabled: !!filters.isAdmin, // Only run if isAdmin is passed in filters
  });
  console.log(
    "adminClaimsQuery function called with filters:",
    adminClaimsQuery.data?.claims
  );
  // 3️⃣ Mutation: Create Claim
  const createMutation = useMutation({
    mutationFn: (formData) => claimService.createClaim(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["claims-me"]);
      toast("Claim submitted successfully!");
    },
    onError: (error) => {
      toast(error.response?.data?.message || "Failed to submit claim");
    },
  });

  // 4️⃣ Mutation: Update Status (Admin)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => claimService.updateClaimStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["claims-admin"]);
      queryClient.invalidateQueries(["claims-me"]);
      toast("Claim status updated");
    },
  });

  // 5️⃣ Mutation: Delete Claim (Admin)
  const deleteMutation = useMutation({
    mutationFn: (id) => claimService.softDeleteClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["claims-admin"]);
      toast("Claim removed");
    },
  });

  return {
    // --- UPDATED DATA MAPPING ---
    // According to your console log, the array is directly in .claims
    myClaims: myClaimsQuery.data?.data.claims || [],
    adminClaims: adminClaimsQuery.data?.claims || [],

    meta: {
      // These are also top-level properties in your response
      total: adminClaimsQuery.data?.total || 0,
      totalPages: adminClaimsQuery.data?.totalPages || 1,
    },

    // ... rest remains the same (isLoading, Actions, etc.)
    isLoading: myClaimsQuery.isLoading || adminClaimsQuery.isLoading,
    isProcessing:
      createMutation.isPending ||
      updateStatusMutation.isPending ||
      deleteMutation.isPending,

    createClaim: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteClaim: deleteMutation.mutateAsync,
  };
};
