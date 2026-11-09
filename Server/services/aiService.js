import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the base instance
const genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Helper to ensure the AI client is ready.
 * This prevents "is not a function" errors and handles missing keys safely.
 */
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "CRITICAL: GEMINI_API_KEY is missing in environment variables."
    );
  }
  return genAIInstance;
};

/**
 * PHASE A: Get Embeddings
 * Used for storing and searching FAQs in MongoDB.
 */
export const getEmbedding = async (text) => {
  try {
    const client = getClient();
    // Using 'text-embedding-004' (768 dimensions)
    const model = client.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding Error:", error.message);
    throw error;
  }
};

/**
 * PHASE B: Get AI Answer
 * Uses Gemini 2.0 Flash (The 2026 standard for speed and accuracy).
 */
export const getAIAnswer = async (query, context) => {
  try {
    const client = getClient();
    // Using 'gemini-2.0-flash' which replaces the older 1.5 versions
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
  You are a NeuralSure Insurance Support bot. Use the PROVIDED FAQ LIST to help the user.

  [PROVIDED FAQ LIST]:
  ${context}

  [USER QUESTION]:
  ${query}

  [INSTRUCTIONS]:
  1. Search the FAQ LIST for any information related to the question.
  2. If the FAQ LIST contains the answer, rephrase it helpfully.
  3. If the FAQ LIST is empty OR clearly does not mention the topic, ONLY then say: "I don't know".
  4. Do not mention "based on the documents" or "in the FAQ". Just answer.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Answer Error:", error.message);
    // Return "I don't know" so your controller triggers the ticket creation
    return "Please create a support ticket for this query.";
  }
};
