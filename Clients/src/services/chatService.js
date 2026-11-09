import api from "@/lib/axios";

/**
 * Sends the user query to the Gemini-powered backend.
 * Uses the pre-configured Axios instance for consistency across the app.
 */
export const sendChatQuery = async ({ userId, query }) => {
  console.log("Sending query to backend:", query, userId);
  try {
    // We use the relative path because the base URL is already in your axios config
    const response = await api.post("/chat/query", {
      userId,
      query,
    });

    // Axios returns the data directly in the .data property
    return response.data;
  } catch (error) {
    // Better error handling for TanStack Query to catch
    const errorMessage =
      error.response?.data?.message || "Failed to connect to the assistant.";
    throw new Error(errorMessage);
  }
};
