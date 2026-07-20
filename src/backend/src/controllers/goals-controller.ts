import type { Request, Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import { goals } from "../db/schema.js";
import { validationError, notFoundError, businessError } from "../utils/errors.js";

interface CreateGoalBody {
  title: string;
  saved?: string | number;
  target: string | number;
}

interface UpdateGoalBody {
  title?: string;
  saved?: string | number;
  target?: string | number;
}

function parseAmount(raw: unknown): number {
  const num = typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);
  if (isNaN(num) || num < 0) {
    throw validationError("Valor deve ser um número positivo válido.");
  }
  return Math.round(num * 100) / 100;
}

export async function createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = req.body as CreateGoalBody;

    if (!body.title || body.title.trim().length === 0) {
      throw validationError("Título da meta é obrigatório.");
    }

    const target = parseAmount(body.target);
    if (target <= 0) {
      throw validationError("Meta alvo deve ser maior que zero.");
    }

    const saved = parseAmount(body.saved || 0);
    if (saved > target) {
      throw businessError("Valor economizado não pode exceder a meta.");
    }

    const db = getDb();
    const [created] = await db
      .insert(goals)
      .values({
        userId,
        title: body.title.trim(),
        saved: saved.toString(),
        target: target.toString(),
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao criar meta.");
    }

    res.status(201).json({
      goal: {
        id: created.id,
        title: created.title,
        saved: parseFloat(created.saved),
        target: parseFloat(created.target),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const db = getDb();

    const rows = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));

    res.json({
      goals: rows.map((r) => ({
        id: r.id,
        title: r.title,
        saved: parseFloat(r.saved),
        target: parseFloat(r.target),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const found = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id));

    const goal = found.find((g) => g.userId === userId);
    if (!goal) {
      throw notFoundError("Meta");
    }

    res.json({
      goal: {
        id: goal.id,
        title: goal.title,
        saved: parseFloat(goal.saved),
        target: parseFloat(goal.target),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = req.body as UpdateGoalBody;

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (body.title.trim().length === 0) {
        throw validationError("Título não pode ser vazio.");
      }
      updates.title = body.title.trim();
    }

    let saved: number | undefined;
    let target: number | undefined;

    if (body.saved !== undefined) saved = parseAmount(body.saved);
    if (body.target !== undefined) target = parseAmount(body.target);

    // If we have both or one is being updated, validate saved <= target
    if (saved !== undefined || target !== undefined) {
      const currentGoal = await db.select().from(goals).where(eq(goals.id, id));
      if (currentGoal.length === 0 || currentGoal[0]!.userId !== userId) {
        throw notFoundError("Meta");
      }
      const finalSaved = saved ?? parseFloat(currentGoal[0]!.saved);
      const finalTarget = target ?? parseFloat(currentGoal[0]!.target);
      if (finalSaved > finalTarget) {
        throw businessError("Valor economizado não pode exceder a meta.");
      }
      if (saved !== undefined) updates.saved = saved.toString();
      if (target !== undefined) updates.target = target.toString();
    }

    if (Object.keys(updates).length === 0) {
      throw validationError("Nenhum campo para atualizar.");
    }

    updates.updatedAt = new Date();

    const db = getDb();
    const [updated] = await db
      .update(goals)
      .set({ ...updates })
      .where(eq(goals.id, id))
      .returning();

    if (!updated || updated.userId !== userId) {
      throw notFoundError("Meta");
    }

    res.json({
      goal: {
        id: updated.id,
        title: updated.title,
        saved: parseFloat(updated.saved),
        target: parseFloat(updated.target),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const result = await db.delete(goals).where(eq(goals.id, id)).returning();

    if (result.length === 0 || result[0]!.userId !== userId) {
      throw notFoundError("Meta");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
