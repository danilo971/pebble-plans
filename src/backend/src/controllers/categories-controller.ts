import type { Request, Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import { categories } from "../db/schema.js";
import { validationError, notFoundError } from "../utils/errors.js";

interface CreateCategoryBody {
  name: string;
  icon?: string;
  limit?: string | number;
}

interface UpdateCategoryBody {
  name?: string;
  icon?: string;
  spent?: string | number;
  limit?: string | number;
}

function parseAmount(raw: unknown): number {
  const num = typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);
  if (isNaN(num) || num < 0) {
    throw validationError("Valor deve ser um número positivo válido.");
  }
  return Math.round(num * 100) / 100;
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = req.body as CreateCategoryBody;

    if (!body.name || body.name.trim().length === 0) {
      throw validationError("Nome da categoria é obrigatório.");
    }

    const limit = parseAmount(body.limit || 0);

    const db = getDb();

    // Check for duplicate name
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, body.name.trim()));

    if (existing.some((c) => c.userId === userId)) {
      throw validationError("Já existe uma categoria com este nome.");
    }

    const [created] = await db
      .insert(categories)
      .values({
        userId,
        name: body.name.trim(),
        icon: body.icon || null,
        spent: "0",
        limit: limit.toString(),
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao criar categoria.");
    }

    res.status(201).json({
      category: {
        id: created.id,
        name: created.name,
        icon: created.icon,
        spent: parseFloat(created.spent!),
        limit: parseFloat(created.limit!),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const db = getDb();

    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(desc(categories.createdAt));

    res.json({
      categories: rows.map((r) => ({
        id: r.id,
        name: r.name,
        icon: r.icon,
        spent: parseFloat(r.spent!),
        limit: parseFloat(r.limit!),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const found = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    const cat = found.find((c) => c.userId === userId);
    if (!cat) {
      throw notFoundError("Categoria");
    }

    res.json({
      category: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        spent: parseFloat(cat.spent!),
        limit: parseFloat(cat.limit!),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = req.body as UpdateCategoryBody;

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        throw validationError("Nome não pode ser vazio.");
      }
      updates.name = body.name.trim();
    }
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.spent !== undefined) updates.spent = parseAmount(body.spent).toString();
    if (body.limit !== undefined) updates.limit = parseAmount(body.limit).toString();

    if (Object.keys(updates).length === 0) {
      throw validationError("Nenhum campo para atualizar.");
    }

    const db = getDb();
    const [updated] = await db
      .update(categories)
      .set({ ...updates })
      .where(eq(categories.id, id))
      .returning();

    if (!updated || updated.userId !== userId) {
      throw notFoundError("Categoria");
    }

    res.json({
      category: {
        id: updated.id,
        name: updated.name,
        icon: updated.icon,
        spent: parseFloat(updated.spent!),
        limit: parseFloat(updated.limit!),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();

    if (result.length === 0 || result[0]!.userId !== userId) {
      throw notFoundError("Categoria");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
