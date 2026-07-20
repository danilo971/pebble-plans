import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";
import { v4 as uuidv4 } from "uuid";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = uuidv4();

  (res.locals as { requestId: string }).requestId = requestId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers["user-agent"]?.slice(0, 100),
      },
      "Request completed"
    );
  });

  next();
}
