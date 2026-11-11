// hooks/useChatbot.js
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendChatQuery } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
export const useChatbot = () => {
  const user = useAuthStore((state) => state.user);
  const currentTier = user?.userPlanTier || user?.planTier || user?.tier;
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I'm your NeuralSure Assistant. How can I help with your insurance today?",
    },
  ]);

  const mutation = useMutation({
    mutationFn: sendChatQuery,
    onMutate: async (newQuery) => {
      // Add user message immediately (Optimistic Update style)
      setMessages((prev) => [
        ...prev,
        { role: "user", content: newQuery.message },
      ]);
    },
    onSuccess: (data) => {
      console.log("Backend said:", data);
      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data?.answer || data?.data?.answer || data?.message || "I could not find this in your policy documents. Please contact member support.",
          sources: data?.sources || data?.data?.sources || [],
        },
      ]);
    },
    onError: (error) => {
      console.error(
        "The exact error is:",
        error.response?.data || error.message
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    },
  });

  const sendMessage = (message) => {
    if (!message.trim()) return;
    mutation.mutate({ message, userPlanTier: currentTier || "support" });
  };

  return {
    messages,
    sendMessage,
    isLoading: mutation.isPending,
  };
};
