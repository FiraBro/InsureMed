import FAQ from "../models/faq.js";
import Ticket from "../models/ticket.js";
import * as aiService from "../services/aiService.js";
import { cosineSimilarity } from "../services/vectorService.js";

export const handleChat = async (req, res) => {
  try {
    const { query, userId } = req.body;

    if (!userId || !query) {
      return res.status(400).json({ error: "userId and query are required." });
    }

    // 1. Convert query to vector
    const queryVector = await aiService.getEmbedding(query);

    // 2. Local Vector Search
    const allFaqs = await FAQ.find({ isActive: true });
    console.log(`Checking ${allFaqs.length} FAQs in database...`); // LOG 1
    const scoredFaqs = allFaqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
      score: cosineSimilarity(queryVector, faq.embedding),
    }));

    // Sort and get top results
    const relatedFaqs = scoredFaqs
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    const contextText = relatedFaqs
      .map((f) => `Q: ${f.question} A: ${f.answer}`)
      .join("\n");

    // 3. Ask AI to answer based on FAQs
    const answer = await aiService.getAIAnswer(query, contextText);

    // 4. Threshold & Keyword Check
    const lowConfidence = !relatedFaqs.length || relatedFaqs[0].score < 0.6;
    const aiGaveUp =
      answer.toLowerCase().includes("i don't know") ||
      answer.toLowerCase().includes("cannot find");

    if (lowConfidence || aiGaveUp) {
      // --- DYNAMIC CATEGORY DETECTION ---
      let detectedCategory = "ACCOUNT"; // Default
      const q = query.toLowerCase();
      if (
        q.includes("claim") ||
        q.includes("accident") ||
        q.includes("hospital")
      )
        detectedCategory = "CLAIM";
      else if (q.includes("pay") || q.includes("bill") || q.includes("price"))
        detectedCategory = "PAYMENT";
      else if (
        q.includes("policy") ||
        q.includes("coverage") ||
        q.includes("plan")
      )
        detectedCategory = "POLICY";

      // 5. Create Ticket with ALL required fields from your schema
      const ticket = await Ticket.create({
        user: userId, // Matches 'user' in your schema (ref: User)
        userQuery: query,
        botDraft: answer,
        subject: query.split(" ").slice(0, 5).join(" ") + "...", // Auto-generate subject
        category: detectedCategory, // Matches your ENUM
        status: "OPEN",
        priority: "LOW",
      });

      return res.status(200).json({
        message:
          "I've created a support ticket for you as I couldn't find a clear answer.",
        ticketId: ticket.ticketId, // Using the TIC-XXXXXX format from your pre-save hook
        status: "unresolved",
        answer: answer, // Still show the AI response so the user knows why it failed
      });
    }

    // 6. Success: FAQ was helpful
    res.status(200).json({
      answer,
      status: "resolved",
      score: relatedFaqs[0]?.score,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ error: error.message });
  }
};
