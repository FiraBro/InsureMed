import User from "../models/user.js";
import Notification from "../models/notification.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * Professional Notification Templates
 * This keeps your messages consistent and easy to edit in one place.
 */
const TEMPLATES = {
  // Inside TEMPLATES in NotificationService.js
  RISK_THRESHOLD_REACHED: {
    title: "High Risk Alert 🚩",
    message: (d) =>
      `Attention: The system loss ratio has reached ${d.ratio}%. Total payouts are at $${d.payout}.`,
    priority: "high",
    category: "analytics",
  },
  // ==============================claim notifications==============================
  CLAIM_RECEIVED: {
    title: "Claim Received 📥",
    message: (d) =>
      `We have successfully received your claim #${d.id}. Our team will review it shortly.`,
    priority: "medium",
    category: "claim",
  },
  CLAIM_APPROVED: {
    title: "Claim Approved ✅",
    message: (d) =>
      `Good news! Your claim #${d.id} for ${d.policy} has been approved.`,
    priority: "high",
    category: "claim",
  },
  CLAIM_REJECTED: {
    title: "Update on Claim ℹ️",
    message: (d) =>
      `Your claim #${d.id} requires further information. Please check your dashboard.`,
    priority: "medium",
    category: "claim",
  },
  PAYMENT_SUCCESS: {
    title: "Payment Received 💳",
    message: (d) =>
      `Thank you. We received your payment of ${d.amount} for policy ${d.policy}.`,
    priority: "low",
    category: "payment",
  },

  // ==============================application notifications==============================

  APPLICATION_SUBMITTED: {
    title: "Application Received 📄",
    message: (d) =>
      `Your application for ${d.planName} has been received. Reference ID: ${d.id}.`,
    priority: "medium",
    category: "policy",
  },
  APPLICATION_APPROVED: {
    title: "Application Approved! 🎉",
    message: (d) =>
      `Congratulations! Your application #${d.id} for ${d.policyType} has been approved. Your coverage is now active.`,
    priority: "high",
    category: "policy",
  },
  APPLICATION_REJECTED: {
    title: "Application Status Update ℹ️",
    message: (d) =>
      `We regret to inform you that your application #${d.id} was not approved. Reason: ${d.reason}`,
    priority: "high",
    category: "policy",
  },

  // ==============================policy notifications==============================
  RENEWAL_REQUESTED: {
    title: "Renewal Processing 🔄",
    message: (d) =>
      `We've received your renewal request for policy ${d.policyNumber}. We are verifying your payment.`,
    priority: "medium",
    category: "policy",
  },
  POLICY_RENEWED: {
    title: "Policy Renewed Successfully! 🎊",
    message: (d) =>
      `Your policy ${d.policyNumber} has been renewed. Your new coverage ends on ${d.endDate}.`,
    priority: "high",
    category: "policy",
  },
  POLICY_STATUS_CHANGED: {
    title: "Policy Update 🔔",
    message: (d) =>
      `The status of your policy ${d.policyNumber} has been changed to ${d.newStatus}.`,
    priority: "medium",
    category: "policy",
  },
  POLICY_CANCELLED: {
    title: "URGENT: Policy Cancelled ❌",
    message: (d) =>
      `Your policy ${d.policyNumber} has been cancelled. Reason: ${d.reason}. Contact support immediately.`,
    priority: "high",
    category: "policy",
  },
  POLICY_EXPIRING: {
    title: "Policy Expiration Warning ⚠️",
    message: (d) =>
      `Your ${d.policy} policy expires in ${d.days} days. Renew now to avoid gaps.`,
    priority: "high",
    category: "policy",
  },
};

class NotificationService {
  // async trigger(eventKey, userId, data = {}) {
  //   try {
  //     const template = TEMPLATES[eventKey];
  //     if (!template) {
  //       console.error(`Notification Template ${eventKey} not found.`);
  //       return;
  //     }

  //     const messageContent = template.message(data);

  //     // Inside your NotificationService trigger()
  //     const notification = await Notification.create({
  //       userId,
  //       title: template.title,
  //       message: messageContent,
  //       category: template.category, // Schema now has this
  //       priority: template.priority, // Schema now has this
  //       status: "pending",
  //       metadata: data, // Schema now has this
  //     });

  //     // If High Priority, send email immediately instead of waiting for cron
  //     if (template.priority === "high") {
  //       await this.sendImmediateEmail(notification, userId);
  //     }

  //     return notification;
  //   } catch (error) {
  //     console.error("Error triggering notification:", error);
  //   }
  // }

  // ... existing imports and TEMPLATES

  async trigger(eventKey, userId, data = {}) {
    console.log(`[NotificationService] 🔔 Trigger called for: ${eventKey}`);

    try {
      const template = TEMPLATES[eventKey];
      if (!template) {
        console.error(
          `[NotificationService] ❌ Template NOT FOUND for: ${eventKey}`
        );
        return null;
      }

      const messageContent = template.message(data);
      console.log(
        `[NotificationService] 📝 Message prepared: "${template.title}"`
      );

      // 🔍 DEBUG: Log the object we are about to save
      const payload = {
        userId,
        title: template.title,
        message: messageContent,
        category: template.category,
        priority: template.priority,
        status: "pending",
        metadata: data,
      };
      console.log(
        "[NotificationService] 📤 Attempting DB Create with payload:",
        payload
      );

      const notification = await Notification.create(payload);

      console.log(
        `[NotificationService] ✅ SUCCESS! Saved with ID: ${notification._id}`
      );

      if (template.priority === "high") {
        console.log(
          "[NotificationService] 📧 High priority detected. Sending immediate email..."
        );
        // Use .catch to ensure email failure doesn't crash the trigger
        this.sendImmediateEmail(notification, userId).catch((err) =>
          console.error("[NotificationService] 📧 Email Error:", err.message)
        );
      }

      return notification;
    } catch (error) {
      // 🚨 THIS WILL TELL YOU EXACTLY WHY MONGO REJECTED IT
      console.error("[NotificationService] ❌ DATABASE ERROR:", error.message);
      if (error.errors) {
        console.error(
          "[NotificationService] 🔍 Validation Details:",
          Object.keys(error.errors)
        );
      }
      return null;
    }
  }

  async sendPendingNotifications() {
    try {
      // Fetch notifications that haven't been emailed yet
      const pending = await Notification.find({ status: "pending" }).limit(50);

      for (const note of pending) {
        const user = await User.findById(note.userId).select("email").lean();
        if (user) {
          await sendEmail({
            to: user.email,
            subject: note.title,
            text: note.message,
          });
        }

        // Update status to prevent double-sending
        note.status = "sent";
        await note.save();
      }
    } catch (error) {
      throw new AppError("Worker failed: " + error.message, 500);
    }
  }

  /**
   * Internal Helper for High Priority
   */
  async sendImmediateEmail(notification, userId) {
    const user = await User.findById(userId).select("email").lean();
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: notification.title,
        text: notification.message,
      });
      await Notification.findByIdAndUpdate(notification._id, {
        status: "sent",
      });
    }
  }
}

export default new NotificationService();
