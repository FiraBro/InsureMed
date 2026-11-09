import express from "express";
// ✅ Import the default instance (no asterisk, no curly braces)
import userController from "../controllers/userController.js";
import { protect, restrictTo } from "../middlewares/protect.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

// Now userController.getUsers is a valid function reference
router.route("/admin/list").get(userController.getUsers);

router.route("/stats").get(userController.getUserStatsSummary);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
