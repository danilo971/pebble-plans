import type { Request, Response } from "express";
import { testDbConnection } from "../db/connection.js";

export async function health(req: Request, res: Response): Promise<void> {
  res.json({
    status: "ok",
    service: "pebble-plans-backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export async function live(req: Request, res: Response): Promise<void> {
  res.json({ status: "alive" });
}

export async function ready(req: Request, res: Response): Promise<void> {
  const dbConnected = await testDbConnection();

  if (!dbConnected) {
    res.status(503).json({
      status: "degraded",
      dependencies: {
        database: "unreachable",
      },
    });
    return;
  }

  res.json({
    status: "ready",
    dependencies: {
      database: "connected",
    },
  });
}
