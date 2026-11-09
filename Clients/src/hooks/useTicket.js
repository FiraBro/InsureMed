import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "@/services/tickerService";
import { toast } from "react-toastify";

export const useTickets = (ticketId = null, fetchAll = false, filters = {}) => {
  const queryClient = useQueryClient();

  // 1. User's personal tickets
  const { data: myTickets, isLoading: isLoadingMy } = useQuery({
    queryKey: ["tickets", "mine", filters],
    queryFn: () => ticketService.getMyTickets(filters),
    select: (res) => ({
      data: res?.data || [],
      pagination: res?.pagination || { page: 1, pages: 1, total: 0 },
    }),
  });

  // 2. Admin Global Queue
  const {
    data: allTickets,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ["tickets", "all", filters],
    queryFn: () => ticketService.getAllTickets(filters),
    select: (res) => ({
      data: res?.data || [],
      pagination: res?.pagination || { page: 1, pages: 1, total: 0 },
    }),
    enabled: fetchAll,
    placeholderData: (previousData) => previousData,
  });

  // 3. Live Chat History
  const { data: ticketDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["tickets", "detail", ticketId],
    queryFn: () => ticketService.getTicketDetails(ticketId),
    enabled: !!ticketId,
    select: (res) => res?.data || res,
    // FIX: Added optional chaining to prevent errors when data is initially undefined
    refetchInterval: (query) =>
      query?.state?.data?.status === "CLOSED" ? false : 3000,
  });

  // --- Mutations ---

  const createMutation = useMutation({
    mutationFn: (ticketData) => ticketService.createTicket(ticketData),
    onSuccess: () => {
      // Precise Invalidation
      queryClient.invalidateQueries({ queryKey: ["tickets", "mine"] });
      if (fetchAll)
        queryClient.invalidateQueries({ queryKey: ["tickets", "all"] });
      toast.success("Case initialized and routed to neural engine");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to initialize case");
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message, sender }) =>
      ticketService.replyToTicket(id, message, sender),
    onSuccess: (_, variables) => {
      // Refetch specific ticket details
      queryClient.invalidateQueries({
        queryKey: ["tickets", "detail", variables.id],
      });
    },
    onError: (err) => toast.error(err.message || "Failed to send message"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => ticketService.updateStatus(id, status),
    onSuccess: (updatedTicket, variables) => {
      // FIX: Instead of refetching everything, we update the local cache for that specific ticket
      // This prevents the whole list from flickering
      queryClient.invalidateQueries({ queryKey: ["tickets"] });

      // Specifically update the detail view cache immediately
      queryClient.setQueryData(
        ["tickets", "detail", variables.id],
        updatedTicket?.data
      );

      toast.success(`Status: ${variables.status.replace("_", " ")}`);
    },
    onError: (err) => toast.error(err.message || "Status sync failed"),
  });

  return {
    myTickets,
    allTickets,
    ticketDetails,
    isLoading: isLoadingMy || isLoadingAll,
    isLoadingDetails,
    refetchAll,
    // Mutations
    createTicket: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    replyToTicket: replyMutation.mutate,
    isReplying: replyMutation.isPending,
    updateStatus: statusMutation.mutate,
    isUpdatingStatus: statusMutation.isPending,
  };
};
