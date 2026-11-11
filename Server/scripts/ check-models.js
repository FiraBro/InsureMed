const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Some versions expose it directly on genAI or require fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();

    if (data.error) {
      console.error("API Key Error:", data.error);
      return;
    }

    console.log("=== Available Models for generateContent ===");
    const generateModels = data.models
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));

    console.log(generateModels);
  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

listModels();
