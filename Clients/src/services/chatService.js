import api from "@/lib/axios";

/**
 * Sends the user query to the Gemini-powered backend.
 * Uses the pre-configured Axios instance for consistency across the app.
 */
export const sendChatQuery = async ({ message, userPlanTier = "support" }) => {
  console.log("Sending chat message to backend:", { message, userPlanTier });
  try {
    const response = await api.post("/chat", { message, userPlanTier });

    // Axios returns the data directly in the .data property
    return response.data;
  } catch (error) {
    // Better error handling for TanStack Query to catch
    const errorMessage =
      error.response?.data?.message || "Failed to connect to the assistant.";
    throw new Error(errorMessage);
  }
};
