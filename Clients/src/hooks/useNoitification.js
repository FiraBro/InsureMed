import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/services/notificationService";
import { toast } from "react-toastify";

export const useNotifications = (filters = {}) => {
  const queryClient = useQueryClient();

  // 1. Fetching Notifications
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => notificationApi.getNotifications(filters),
    refetchInterval: 30000, // Background poll every 30 seconds for "real-time" feel
    staleTime: 10000,
  });
  console.log("Notification Data:", data);
  // 2. Mark as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      // Invalidate cache to refresh list and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 3. Mark All as Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onMutate: async () => {
      // Optimistic Update: Instantly clear unread state in UI
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old) => ({
        ...old,
        data: old.data.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["notifications"], context.previousData);
      toast.error("Failed to mark all as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.info("Notification removed");
    },
  });

  return {
    notifications: data?.data || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    isError,
    markAsRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    refetch,
  };
};
