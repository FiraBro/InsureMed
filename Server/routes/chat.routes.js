import express from "express";
import { postChat } from "../controllers/chat.controller.js";

const router = express.Router();
router.post("/", postChat);

export default router;
