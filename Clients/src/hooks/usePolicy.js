import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policyService } from "@/services/policyService";
import { toast } from "react-toastify";

export const usePolicies = () => {
  const queryClient = useQueryClient();

  // --- QUERIES ---

  // Get current user's policies - Now supports search and pagination
  const useMyPolicies = (query = {}) => {
    return useQuery({
      // 1. Keep the query object in the key so React Query refetches on change
      queryKey: ["policies", "my", query],

      // 2. Explicitly pass the query object to your service
      queryFn: () => policyService.getMyPolicies(query),

      staleTime: 1000 * 60 * 5,
      placeholderData: (previousData) => previousData,
    });
  };
  // console.log("data from poly hook:", useMyPolicies);

  // List all policies (Admin) - Supports filtering/pagination
  const useAdminPolicies = (query = {}) => {
    return useQuery({
      queryKey: ["policies", "admin", query],
      queryFn: () => policyService.listPolicies(query),
      placeholderData: (previousData) => previousData, // Keeps UI stable while fetching new pages
    });
  };
  // console.log("useAdminPolicies function called", useAdminPolicies);

  // Get single policy
  const usePolicy = (id) => {
    return useQuery({
      queryKey: ["policies", id],
      queryFn: () => policyService.getPolicyById(id),
      enabled: !!id, // Only fetch if ID exists
    });
  };

  // --- MUTATIONS ---

  // Generic mutation handler to reduce code repetition
  const usePolicyMutation = (mutationFn, successMsg) => {
    return useMutation({
      mutationFn: ({ id, data }) => mutationFn(id, data),
      onSuccess: () => {
        // Invalidate all policy queries to trigger a fresh background fetch
        queryClient.invalidateQueries({ queryKey: ["policies"] });
        if (successMsg) toast(successMsg);
      },
      onError: (error) => {
        toast(error?.response?.data?.message || "Action failed");
      },
    });
  };

  // Specific Mutations
  const updateStatus = usePolicyMutation(
    (id, status) => policyService.updatePolicyStatus(id, status),
    "Policy status updated successfully"
  );

  const renewPolicy = usePolicyMutation(
    (id, data) => policyService.requestPolicyRenewal(id, data),
    "Renewal request submitted"
  );

  const approveRenewal = usePolicyMutation(
    (id) => policyService.approvePolicyRenewal(id),
    "Policy renewal approved"
  );

  const cancelPolicy = usePolicyMutation(
    (id) => policyService.cancelPolicy(id),
    "Policy has been cancelled"
  );

  const deletePolicy = useMutation({
    mutationFn: (id) => policyService.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast("Policy permanently deleted");
    },
  });

  return {
    // Queries
    useMyPolicies,
    useAdminPolicies,
    usePolicy,
    // Mutations
    updateStatus,
    renewPolicy,
    approveRenewal,
    cancelPolicy,
    deletePolicy,
  };
};
