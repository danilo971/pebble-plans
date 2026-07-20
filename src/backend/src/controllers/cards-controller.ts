import type { Request, Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import { cards } from "../db/schema.js";
import { validationError, notFoundError } from "../utils/errors.js";

interface CreateCardBody {
  name: string;
  brand: string;
  last4: string;
  limit: string | number;
  dueDay: number;
  color?: string;
}

interface UpdateCardBody {
  name?: string;
  brand?: string;
  last4?: string;
  limit?: string | number;
  used?: string | number;
  dueDay?: number;
  color?: string;
}

function parseAmount(raw: unknown): number {
  const num = typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);
  if (isNaN(num) || num < 0) {
    throw validationError("Valor deve ser um número positivo válido.");
  }
  return Math.round(num * 100) / 100;
}

export async function createCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = req.body as CreateCardBody;

    if (!body.name || body.name.trim().length === 0) {
      throw validationError("Nome do cartão é obrigatório.");
    }
    if (!body.brand || body.brand.trim().length === 0) {
      throw validationError("Bandeira é obrigatória.");
    }
    if (!body.last4 || body.last4.length !== 4 || !/^\d{4}$/.test(body.last4)) {
      throw validationError("Últimos 4 dígitos devem ser exatamente 4 números.");
    }
    if (body.dueDay < 1 || body.dueDay > 31) {
      throw validationError("Dia de vencimento deve estar entre 1 e 31.");
    }

    const limit = parseAmount(body.limit);
    if (limit <= 0) {
      throw validationError("Limite deve ser maior que zero.");
    }

    const db = getDb();

    // Check for duplicate name
    const existing = await db
      .select()
      .from(cards)
      .where(eq(cards.name, body.name.trim()));

    if (existing.some((c) => c.userId === userId)) {
      throw validationError("Já existe um cartão com este nome.");
    }

    const [created] = await db
      .insert(cards)
      .values({
        userId,
        name: body.name.trim(),
        brand: body.brand.trim(),
        last4: body.last4,
        limit: limit.toString(),
        used: "0",
        dueDay: body.dueDay,
        color: body.color || null,
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao criar cartão.");
    }

    res.status(201).json({
      card: {
        id: created.id,
        name: created.name,
        brand: created.brand,
        last4: created.last4,
        limit: parseFloat(created.limit),
        used: parseFloat(created.used),
        dueDay: created.dueDay,
        color: created.color,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listCards(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const db = getDb();

    const rows = await db
      .select()
      .from(cards)
      .where(eq(cards.userId, userId))
      .orderBy(desc(cards.createdAt));

    res.json({
      cards: rows.map((r) => ({
        id: r.id,
        name: r.name,
        brand: r.brand,
        last4: r.last4,
        limit: parseFloat(r.limit),
        used: parseFloat(r.used),
        dueDay: r.dueDay,
        color: r.color,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const found = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id));

    const card = found.find((c) => c.userId === userId);
    if (!card) {
      throw notFoundError("Cartão");
    }

    res.json({
      card: {
        id: card.id,
        name: card.name,
        brand: card.brand,
        last4: card.last4,
        limit: parseFloat(card.limit),
        used: parseFloat(card.used),
        dueDay: card.dueDay,
        color: card.color,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = req.body as UpdateCardBody;

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        throw validationError("Nome não pode ser vazio.");
      }
      updates.name = body.name.trim();
    }
    if (body.brand !== undefined) updates.brand = body.brand.trim();
    if (body.last4 !== undefined) {
      if (body.last4.length !== 4 || !/^\d{4}$/.test(body.last4)) {
        throw validationError("Últimos 4 dígitos devem ser exatamente 4 números.");
      }
      updates.last4 = body.last4;
    }
    if (body.limit !== undefined) updates.limit = parseAmount(body.limit).toString();
    if (body.used !== undefined) updates.used = parseAmount(body.used).toString();
    if (body.dueDay !== undefined) {
      if (body.dueDay < 1 || body.dueDay > 31) {
        throw validationError("Dia de vencimento deve estar entre 1 e 31.");
      }
      updates.dueDay = body.dueDay;
    }
    if (body.color !== undefined) updates.color = body.color;

    if (Object.keys(updates).length === 0) {
      throw validationError("Nenhum campo para atualizar.");
    }

    const db = getDb();
    const [updated] = await db
      .update(cards)
      .set({ ...updates })
      .where(eq(cards.id, id))
      .returning();

    if (!updated || updated.userId !== userId) {
      throw notFoundError("Cartão");
    }

    res.json({
      card: {
        id: updated.id,
        name: updated.name,
        brand: updated.brand,
        last4: updated.last4,
        limit: parseFloat(updated.limit),
        used: parseFloat(updated.used),
        dueDay: updated.dueDay,
        color: updated.color,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const result = await db.delete(cards).where(eq(cards.id, id)).returning();

    if (result.length === 0 || result[0]!.userId !== userId) {
      throw notFoundError("Cartão");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
