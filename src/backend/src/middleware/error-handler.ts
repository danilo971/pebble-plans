import type { Request, Response, NextFunction } from "express";
import { AppException } from "../utils/errors.js";
import { logger } from "../config/logger.js";
import { v4 as uuidv4 } from "uuid";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (res.locals as { requestId?: string }).requestId || uuidv4();

  if (err instanceof AppException) {
    logger.warn({ requestId, code: err.code, message: err.message }, err.message);
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  logger.error({ requestId, err: err.message, stack: err.stack }, "Internal server error");

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor. Tente novamente mais tarde.",
    },
  });
}
