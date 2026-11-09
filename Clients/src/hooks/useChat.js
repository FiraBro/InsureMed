// hooks/useChatbot.js
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendChatQuery } from "@/services/chatService";
export const useChatbot = (userId) => {
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
        { role: "user", content: newQuery.query },
      ]);
    },
    onSuccess: (data) => {
      console.log("Backend said:", data);
      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.answer || data.message,
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

  const sendMessage = (query) => {
    if (!query.trim()) return;
    mutation.mutate({ userId, query });
  };

  return {
    messages,
    sendMessage,
    isLoading: mutation.isPending,
  };
};
