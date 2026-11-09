import express from "express";
import * as ticketController from "../controllers/ticketController.js";
import { addFAQ, fetchFAQs, editFAQ } from "../controllers/faqController.js";
import { protect, restrictTo } from "../middlewares/protect.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

/* ============================
   AUTHENTICATION (ALL ROUTES)
============================ */
router.use(protect);

/* ============================
   TICKETS – CUSTOMER & STAFF
============================ */

router.post("/", ticketController.createTicket);
router.get("/my-tickets", ticketController.getMyTickets);

router.get(
  "/",
  restrictTo(ROLES.ADMIN, ROLES.AGENT),
  ticketController.getAllTickets
);

router.get("/:id", ticketController.getTicketDetails);

router.post("/:id/messages", ticketController.addReply);

/* ============================
   TICKETS – STAFF ONLY
============================ */

router.patch(
  "/:id/status",
  restrictTo(ROLES.ADMIN, ROLES.AGENT),
  ticketController.updateStatus
);

router.patch(
  "/:id/assign",
  restrictTo(ROLES.ADMIN),
  ticketController.assignTicket
);

/* ============================
   FAQ – PUBLIC & ADMIN
============================ */

router.get("/faqs", fetchFAQs);

router.post("/faqs", restrictTo(ROLES.ADMIN), addFAQ);

router.patch("/faqs/:id", restrictTo(ROLES.ADMIN), editFAQ);

export default router;
