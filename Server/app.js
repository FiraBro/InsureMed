import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";

// Import your business logic
import "./cron/escalation.js";
import authRouter from "./routes/authRoutes.js";
import insurancePlanRouter from "./routes/planRoutes.js";
import policyRoute from "./routes/policyRoutes.js";
import claimRouter from "./routes/claimRoutes.js";
import userRouter from "./routes/userRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import chatRoutes from "./routes/aiRoutes.js";

import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middlewares/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();

// ==========================================
// 1. SWAGGER CONFIGURATION
// ==========================================
const swaggerPath = path.join(process.cwd(), "openapi.yaml");
let swaggerDocument;

try {
  // Read the YAML file you created earlier
  swaggerDocument = yaml.load(fs.readFileSync(swaggerPath, "utf8"));
} catch (e) {
  console.error(
    "❌ Failed to load openapi.yaml. Documentation will be unavailable.",
  );
}

// ==========================================
// 2. GLOBAL MIDDLEWARE
// ==========================================
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // Allow all origins for dev; restrict in production
    },
    credentials: true,
  }),
);

// Serve static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ==========================================
// 3. DOCUMENTATION ROUTE (Visit /api-docs)
// ==========================================
if (swaggerDocument) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ==========================================
// 4. API ROUTES
// ==========================================
const versions = "v1";

// Home Route
app.get("/", (req, res) => {
  res.send(
    `Insurance API is running. Documentation: <a href="/api-docs">/api-docs</a>`,
  );
});

app.use(`/api/${versions}/auth`, authRouter);
app.use(`/api/${versions}/plans`, insurancePlanRouter);
app.use(`/api/${versions}/policies`, policyRoute);
app.use(`/api/${versions}/claims`, claimRouter);
app.use(`/api/${versions}/users`, userRouter);
app.use(`/api/${versions}/notifications`, notificationRouter);
app.use(`/api/${versions}/admin`, adminRoutes);
app.use(`/api/${versions}/dashboard`, dashboardRoutes);
app.use(`/api/${versions}/support/tickets`, ticketRoutes);
app.use(`/api/${versions}/applications`, applicationRoutes);
app.use(`/api/${versions}/chat`, chatRoutes);

// ==========================================
// 5. ERROR HANDLING
// ==========================================

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global Error Handler (must be last)
app.use(globalErrorHandler);

export default app;
