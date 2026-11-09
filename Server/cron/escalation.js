import cron from "node-cron";
import Ticket from "../models/ticket.js";
import sendEmail from "../utils/sendEmail.js";
// Run every 5 minutes: '*/5 * * * *'
cron.schedule("*/5 * * * *", async () => {
  // Running every 5 mins is enough [web:18][web:28]
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // --- LOGIC A: THE WARNING (T-Minus 1 Hour) ---
    const warningTickets = await Ticket.find({
      status: { $in: ["OPEN", "IN_REVIEW"] },
      warningSent: false,
      isEscalated: false,
      slaDeadline: { $gt: now, $lt: oneHourFromNow }, // Deadline is between now and +1 hour
    }).populate("assignedTo user"); // Fixed: populate nested refs [web:20][web:23]

    for (const ticket of warningTickets) {
      ticket.warningSent = true;
      await ticket.save();

      if (ticket.assignedTo && ticket.assignedTo.email) {
        await sendEmail({
          email: ticket.assignedTo.email,
          subject: `⚠️ WARNING: Ticket ${ticket.ticketId} expires soon`,
          message: `Hello ${
            ticket.assignedTo.name || "Team"
          }, you have less than 1 hour to respond to ticket ${
            ticket.ticketId
          } before it is escalated.`,
        });
      }
    }

    // --- LOGIC B: THE ESCALATION (Now completed) ---
    const overdueTickets = await Ticket.find({
      status: { $in: ["OPEN", "IN_REVIEW"] },
      isEscalated: false,
      slaDeadline: { $lt: now },
    }).populate("user"); // Consistent populate [web:23]

    for (const ticket of overdueTickets) {
      // Fixed: complete loop logic
      ticket.isEscalated = true;
      ticket.priority = "EMERGENCY"; // Force upgrade priority
      await ticket.save();

      // Notify the Admin
      await sendEmail({
        email: "jemalfiragos@gmail.com",
        subject: `🚨 ESCALATION: Ticket ${ticket.ticketId} is overdue!`,
        message: `Ticket ${ticket.ticketId} from ${
          ticket.user?.name || "N/A"
        } has exceeded its SLA.`,
      });
    }
  } catch (error) {
    console.error("Cron job error:", error); // Added for debugging [web:30]
  }
});
