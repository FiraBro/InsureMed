import cron from "node-cron";
import claimService from "../services/claimService.js";

// Run daily at 8 AM to remind users about pending claims
cron.schedule("0 8 * * *", async () => {
  try {
    console.log("Running claim reminder job...");
    await claimService.sendClaimReminders();
    console.log("Claim reminders sent successfully");
  } catch (error) {
    console.error("Claim reminder job failed:", error);
  }
});
