import React from "react";
import { Outlet } from "react-router-dom";
import InsuranceChatbot from "@/pages/users/support/Chatbot";

const SupportWrapper = () => {
  return (
    <>
      {/* This renders SupportPage or TicketDetailPage */}
      <Outlet />

      {/* The Chatbot is now globally available only on these child routes */}
      <InsuranceChatbot />
    </>
  );
};

export default SupportWrapper;
