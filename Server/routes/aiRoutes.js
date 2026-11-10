import express from "express";
import { handleChat } from "../controllers/aiController.js";
import { protect } from "../middlewares/protect.js";
const router = express.Router();

router.post("/query", protect, handleChat);
export default router;
