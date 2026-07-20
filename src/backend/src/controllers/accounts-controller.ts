import type { Request, Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import { accounts } from "../db/schema.js";
import { validationError, notFoundError } from "../utils/errors.js";

interface CreateAccountBody {
  name: string;
  kind: string;
  balance?: string | number;
}

interface UpdateAccountBody {
  name?: string;
  kind?: string;
  balance?: string | number;
}

function parseAmount(raw: unknown): number {
  const num = typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);
  if (isNaN(num)) {
    throw validationError("Saldo deve ser um número válido.");
  }
  return Math.round(num * 100) / 100;
}

export async function createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = req.body as CreateAccountBody;

    if (!body.name || body.name.trim().length === 0) {
      throw validationError("Nome da conta é obrigatório.");
    }
    if (!body.kind || body.kind.trim().length === 0) {
      throw validationError("Tipo da conta é obrigatório.");
    }

    const balance = parseAmount(body.balance || 0);

    const db = getDb();

    // Check for duplicate name
    const existing = await db
      .select()
      .from(accounts)
      .where(eq(accounts.name, body.name.trim()));

    if (existing.some((a) => a.userId === userId)) {
      throw validationError("Já existe uma conta com este nome.");
    }

    const [created] = await db
      .insert(accounts)
      .values({
        userId,
        name: body.name.trim(),
        kind: body.kind.trim(),
        balance: balance.toString(),
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao criar conta.");
    }

    res.status(201).json({
      account: {
        id: created.id,
        name: created.name,
        kind: created.kind,
        balance: parseFloat(created.balance),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const db = getDb();

    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));

    res.json({
      accounts: rows.map((r) => ({
        id: r.id,
        name: r.name,
        kind: r.kind,
        balance: parseFloat(r.balance),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const found = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));

    const account = found.find((a) => a.userId === userId);
    if (!account) {
      throw notFoundError("Conta");
    }

    res.json({
      account: {
        id: account.id,
        name: account.name,
        kind: account.kind,
        balance: parseFloat(account.balance),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = req.body as UpdateAccountBody;

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        throw validationError("Nome não pode ser vazio.");
      }
      updates.name = body.name.trim();
    }
    if (body.kind !== undefined) updates.kind = body.kind.trim();
    if (body.balance !== undefined) updates.balance = parseAmount(body.balance).toString();

    if (Object.keys(updates).length === 0) {
      throw validationError("Nenhum campo para atualizar.");
    }

    const db = getDb();
    const [updated] = await db
      .update(accounts)
      .set({ ...updates })
      .where(eq(accounts.id, id))
      .returning();

    if (!updated || updated.userId !== userId) {
      throw notFoundError("Conta");
    }

    res.json({
      account: {
        id: updated.id,
        name: updated.name,
        kind: updated.kind,
        balance: parseFloat(updated.balance),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const result = await db.delete(accounts).where(eq(accounts.id, id)).returning();

    if (result.length === 0 || result[0]!.userId !== userId) {
      throw notFoundError("Conta");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
