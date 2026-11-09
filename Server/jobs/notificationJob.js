import cron from "node-cron";
import notificationService from "../services/notificationService.js";

// Run daily at 9 AM to send pending notifications
cron.schedule("0 9 * * *", async () => {
  try {
    console.log("Running notification job...");
    await notificationService.sendPendingNotifications();
    console.log("Notifications sent successfully");
  } catch (error) {
    console.error("Notification job failed:", error);
  }
});
