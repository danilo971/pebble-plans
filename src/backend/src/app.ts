import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { getEnv } from "./config/env.js";
import { logger } from "./config/logger.js";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler } from "./middleware/error-handler.js";

import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import cardRoutes from "./routes/cards.js";
import accountRoutes from "./routes/accounts.js";
import goalRoutes from "./routes/goals.js";
import categoryRoutes from "./routes/categories.js";
import healthRoutes from "./routes/health.js";

export function createApp() {
  const env = getEnv();
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Rate limiting (except for health checks)
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Muitas requisições. Tente novamente mais tarde.",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Request logging
  app.use(requestLogger);

  // Health check (no auth required)
  app.use("/health", healthRoutes);

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/cards", cardRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/categories", categoryRoutes);

  // Root
  app.get("/", (_req, res) => {
    res.json({
      service: "pebble-plans-backend",
      version: "1.0.0",
      docs: "/health",
    });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Recurso não encontrado.",
      },
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
