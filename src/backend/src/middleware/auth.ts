import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import { authError } from "../utils/errors.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(authError("Token de autenticação não fornecido."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, getEnv().JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(authError("Token de autenticação expirado."));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(authError("Token de autenticação inválido."));
    }
    return next(authError("Erro na validação do token."));
  }
}
