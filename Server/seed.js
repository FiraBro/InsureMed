import dotenv from "dotenv";
// import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import FAQ from "./models/faq.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.join(__dirname, ".env") });

const sampleFAQs = [
  {
    question: "How can I reset my account password?",
    answer:
      "Click the 'Forgot Password' link on the login page, enter your registered email, and follow the link sent to your inbox to create a new password.",
  },
  {
    question: "How do I update my profile or contact information?",
    answer:
      "Log in to your dashboard, go to 'Account Settings,' and select 'Profile.' You can update your phone number, email, and mailing address there.",
  },
  {
    question: "Is my personal data secure on this platform?",
    answer:
      "Yes, we use industry-standard AES-256 encryption and Multi-Factor Authentication (MFA) to ensure your sensitive insurance data remains private.",
  },
  {
    question: "What is the deadline for submitting a claim?",
    answer:
      "All reimbursement claims must be submitted within 30 days of the medical service date or incident to be eligible for processing.",
  },
  {
    question: "How do I file a new insurance claim?",
    answer:
      "Navigate to the 'Claims' tab in your dashboard, click 'Submit New Claim,' upload your digital receipts/invoices, and provide a brief description of the event.",
  },
  {
    question: "How can I track the status of my claim?",
    answer:
      "Once submitted, you can track your claim in real-time under the 'Claim History' section. Statuses include: Pending, Under Review, Approved, or Rejected.",
  },
  {
    question: "What does a 'Deductible' mean?",
    answer:
      "A deductible is the fixed amount you pay out-of-pocket for covered services before your insurance plan begins to pay.",
  },
  {
    question: "How do I add a dependent to my policy?",
    answer:
      "Go to 'My Policies,' select your active plan, and click 'Add Dependent.' You will need to upload proof of relationship (e.g., birth or marriage certificate).",
  },
  {
    question: "Are pre-existing conditions covered?",
    answer:
      "Coverage for pre-existing conditions depends on your specific plan. Most plans cover them after a 12-month waiting period of continuous enrollment.",
  },
  {
    question: "How can I pay my insurance premium?",
    answer:
      "We accept credit/debit cards, bank transfers, and automated clearing house (ACH) payments. You can pay via the 'Billing' section of your portal.",
  },
  {
    question: "Will my policy renew automatically?",
    answer:
      "Yes, most policies are set to auto-renew annually using your saved payment method to ensure continuous coverage. You can opt-out in 'Billing Settings'.",
  },
  {
    question: "What happens if I miss a payment?",
    answer:
      "We provide a 15-day grace period. If payment is not received within this time, your coverage may be suspended until the balance is cleared.",
  },
  {
    question: "How do I download my Insurance ID card?",
    answer:
      "Your digital ID card is available 24/7 under the 'Documents' tab. You can download it as a PDF or send it directly to your healthcare provider.",
  },
  {
    question: "How can I speak to a human agent?",
    answer:
      "If the AI cannot help, you can click 'Open Ticket' or call our 24/7 support line at 1-800-FIRA-BOSS.",
  },
];

async function seedDatabase() {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim(); // .trim() removes hidden spaces/newlines

    if (!apiKey) {
      console.error("❌ ERROR: GEMINI_API_KEY is missing from .env");
      process.exit(1);
    }

    console.log("DEBUG: Key detected. Length:", apiKey.length);

    // Connect to DB
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://admin:admin123@127.0.0.1:27019/health_insurance?authSource=admin"
    );
    console.log("✅ Connected to MongoDB", process.env.MONGO_URI);

    // Initialize AI inside the function
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    await FAQ.deleteMany({});

    for (const faq of sampleFAQs) {
      try {
        console.log(`📡 Processing: ${faq.question}`);

        const result = await model.embedContent(faq.question);

        // VALIDATION: If the API failed, result.embedding won't exist
        if (!result || !result.embedding || !result.embedding.values) {
          throw new Error(
            `Gemini API failed to return a vector for: ${faq.question}`
          );
        }

        const vector = result.embedding.values;

        await FAQ.create({
          ...faq,
          embedding: vector,
          isActive: true,
        });

        console.log(`✅ Success: ${faq.question}`);

        // RATE LIMIT PROTECTION: Essential for Docker & Gemini Free Tier
        // Wait 2 seconds between each request
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ CRITICAL ERROR on "${faq.question}":`, error.message);

        if (error.message.includes("429")) {
          console.log(
            "👉 You hit the Rate Limit. Increase the timeout to 3000ms."
          );
        }

        // Stop the script immediately so you don't save more broken data
        process.exit(1);
      }
    }

    console.log("🚀 SUCCESS: Database Seeded!");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING FAILED:", error.message);
    if (error.message.includes("API key not valid")) {
      console.log(
        "👉 Tip: Check if there's a typo in the .env file or if the key has expired."
      );
    }
    process.exit(1);
  }
}

seedDatabase();
