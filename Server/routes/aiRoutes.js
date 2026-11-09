import express from "express";
import { handleChat } from "../controllers/aiController.js";
const router = express.Router();

router.post("/query", handleChat);
export default router;
