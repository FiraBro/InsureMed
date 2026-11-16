import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not configured.");
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const data = await response.json();

    if (data.error) {
      console.error("API Key Error:", data.error);
      return;
    }

    console.log("=== Available Models for generateContent ===");
    const generateModels = data.models
      ?.filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      ?.map((m) => m.name.replace("models/", "")) || [];

    console.log(generateModels);
  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

listModels();
