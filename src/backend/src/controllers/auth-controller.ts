import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import { users, refreshTokens } from "../db/schema.js";
import { getEnv } from "../config/env.js";
import {
  authError,
  conflictError,
  validationError,
  notFoundError,
  businessError,
} from "../utils/errors.js";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const SALT_ROUNDS = 12;

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body as RegisterBody;

    if (!name || !email || !password) {
      throw validationError("Campos obrigatórios ausentes.", [
        "name é obrigatório",
        "email é obrigatório",
        "password é obrigatório",
      ]);
    }

    if (password.length < 8) {
      throw validationError("A senha deve ter pelo menos 8 caracteres.");
    }

    if (name.length > 100) {
      throw validationError("O nome deve ter no máximo 100 caracteres.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw validationError("E-mail inválido.");
    }

    const db = getDb();

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) {
      throw conflictError("Um usuário com este e-mail já existe.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const [created] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        avatarInitials: initials || null,
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao criar usuário.");
    }

    res.status(201).json({
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        avatarInitials: created.avatarInitials,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      throw validationError("E-mail e senha são obrigatórios.");
    }

    const db = getDb();
    const found = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (found.length === 0) {
      // Use same message to prevent user enumeration
      throw authError("Credenciais inválidas.");
    }

    const user = found[0]!;
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw authError("Credenciais inválidas.");
    }

    const payload = { id: user.id, email: user.email, name: user.name };

    const accessToken = jwt.sign(payload, getEnv().JWT_SECRET, {
      expiresIn: getEnv().ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, getEnv().REFRESH_TOKEN_SECRET, {
      expiresIn: getEnv().REFRESH_TOKEN_EXPIRES_IN,
    });

    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpires,
    });

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarInitials: user.avatarInitials,
      },
      accessToken,
      refreshToken,
      expiresIn: getEnv().ACCESS_TOKEN_EXPIRES_IN,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken: string };

    if (!token) {
      throw validationError("Refresh token não fornecido.");
    }

    const db = getDb();

    // Find token in DB
    const found = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));

    if (found.length === 0 || found[0]!.revokedAt !== null) {
      throw authError("Refresh token inválido ou revogado.");
    }

    const stored = found[0]!;
    if (new Date(stored.expiresAt) < new Date()) {
      // Revoke expired token
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.id, stored.id));
      throw authError("Refresh token expirado.");
    }

    // Verify JWT
    const payload = jwt.verify(token, getEnv().REFRESH_TOKEN_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    // Revoke old token
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, stored.id));

    // Issue new tokens
    const newPayload = { id: payload.id, email: payload.email, name: payload.name };

    const newAccessToken = jwt.sign(newPayload, getEnv().JWT_SECRET, {
      expiresIn: getEnv().ACCESS_TOKEN_EXPIRES_IN,
    });

    const newRefreshToken = jwt.sign(newPayload, getEnv().REFRESH_TOKEN_SECRET, {
      expiresIn: getEnv().REFRESH_TOKEN_EXPIRES_IN,
    });

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: payload.id,
      token: newRefreshToken,
      expiresAt: newExpiry,
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: getEnv().ACCESS_TOKEN_EXPIRES_IN,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const db = getDb();

    const found = await db.select().from(users).where(eq(users.id, userId));
    if (found.length === 0) {
      throw notFoundError("Usuário");
    }

    const user = found[0]!;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarInitials: user.avatarInitials,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name } = req.body as { name: string };

    if (!name || name.trim().length === 0) {
      throw validationError("Nome é obrigatório.");
    }

    if (name.length > 100) {
      throw validationError("O nome deve ter no máximo 100 caracteres.");
    }

    const db = getDb();
    const initials = name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const [updated] = await db
      .update(users)
      .set({ name: name.trim(), avatarInitials: initials, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      throw notFoundError("Usuário");
    }

    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatarInitials: updated.avatarInitials,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken: string };

    if (token) {
      const db = getDb();
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.token, token));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
