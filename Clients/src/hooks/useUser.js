import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { toast } from "react-toastify";
import { useState } from "react";

export const useUsers = (filters) => {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  // 1. Primary Query: Admin Paginated List
  const adminQuery = useQuery({
    queryKey: ["users-admin", filters],
    queryFn: () => userService.listUsersAdmin(filters),
    placeholderData: (prev) => prev, // Keeps UI stable during fetches
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
  // 2. CSV Export Logic (Integrated into hook)
  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      // Fetch matching data without the 10-item limit
      const allMatchingUsers = await userService.exportUsersCSV({
        search: filters.search,
        status: filters.status,
      });

      if (!allMatchingUsers || allMatchingUsers.length === 0) {
        toast("No records found to export");
        return;
      }

      // Format CSV
      const headers = "Full Name,Email,Account Type,Joined Date\n";
      const rows = allMatchingUsers
        .map(
          (user) =>
            `"${user.fullName}","${user.email}","${
              user.isApplicant ? "Applicant" : "Registered"
            }","${new Date(user.createdAt).toLocaleDateString()}"`
        )
        .join("\n");

      const blob = new Blob([headers + rows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `export_${filters.status}_${Date.now()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("Export successful");
    } catch (err) {
      toast("Export failed");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Mutation: Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["users-admin"]);
      toast("User successfully updated");
    },
  });

  // 3. Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users-admin"]);
      toast("User permanently removed");
    },
  });

  return {
    // Data
    data: adminQuery.data || {}, // Contains { users, total, totalPages }
    isLoading: adminQuery.isLoading,
    isFetching: adminQuery.isFetching,
    // Export action and state
    exportToCSV,
    isExporting,

    // Actions
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isProcessing: updateMutation.isPending || deleteMutation.isPending,
  };
};
