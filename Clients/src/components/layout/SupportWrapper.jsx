import React from "react";
import { Outlet } from "react-router-dom";
import InsuranceChatbot from "@/pages/users/support/Chatbot";
import { useAuthStore } from "@/stores/authStore";

const SupportWrapper = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* This renders SupportPage or TicketDetailPage */}
      <Outlet />

      {/* The Chatbot is now globally available only on these child routes */}
      <InsuranceChatbot userId={user?.id} />
    </>
  );
};

export default SupportWrapper;
