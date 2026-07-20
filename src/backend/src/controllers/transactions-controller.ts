import type { Request, Response, NextFunction } from "express";
import { eq, desc, sql, and, gte, lte, like } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import { transactions } from "../db/schema.js";
import {
  validationError,
  notFoundError,
  businessError,
} from "../utils/errors.js";

const VALID_KINDS = ["income", "expense", "transfer"] as const;
type TxKind = (typeof VALID_KINDS)[number];

interface CreateTxBody {
  merchant: string;
  category: string;
  kind: string;
  amount: string | number;
  date?: string;
  account?: string;
  note?: string;
}

interface UpdateTxBody {
  merchant?: string;
  category?: string;
  kind?: string;
  amount?: string | number;
  date?: string;
  account?: string;
  note?: string;
}

function parseAmount(raw: unknown): number {
  const num = typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);
  if (isNaN(num) || num < 0) {
    throw validationError("Valor deve ser um número positivo válido.");
  }
  return Math.round(num * 100) / 100;
}

function validateKind(kind: unknown): TxKind {
  if (!kind || !VALID_KINDS.includes(kind as TxKind)) {
    throw validationError("Tipo de transação inválido. Valores aceitos: income, expense, transfer.", [
      "kind deve ser 'income', 'expense' ou 'transfer'",
    ]);
  }
  return kind as TxKind;
}

export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = req.body as CreateTxBody;

    if (!body.merchant || body.merchant.trim().length === 0) {
      throw validationError("Nome do estabelecimento é obrigatório.");
    }
    if (!body.category || body.category.trim().length === 0) {
      throw validationError("Categoria é obrigatória.");
    }

    const kind = validateKind(body.kind);
    const amount = parseAmount(body.amount);

    const db = getDb();
    const txDate = body.date ? new Date(body.date) : new Date();

    if (isNaN(txDate.getTime())) {
      throw validationError("Data inválida.");
    }

    const [created] = await db
      .insert(transactions)
      .values({
        userId,
        merchant: body.merchant.trim(),
        category: body.category.trim(),
        kind,
        amount: amount.toString(),
        date: txDate,
        account: body.account?.trim() || null,
        note: body.note?.trim() || null,
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao criar transação.");
    }

    res.status(201).json({
      transaction: {
        id: created.id,
        merchant: created.merchant,
        category: created.category,
        kind: created.kind as TxKind,
        amount: parseFloat(created.amount),
        date: created.date.toISOString(),
        account: created.account,
        note: created.note,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const db = getDb();

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const { kind, search, from, to } = req.query;

    const conditions = [eq(transactions.userId, userId)];

    if (kind && typeof kind === "string" && VALID_KINDS.includes(kind as TxKind)) {
      conditions.push(eq(transactions.kind, kind));
    }

    if (search && typeof search === "string") {
      conditions.push(
        and(
          like(transactions.merchant, `%${search}%`),
          or(like(transactions.category, `%${search}%`))
        ) || like(transactions.merchant, `%${search}%`)
      );
    }

    if (from && typeof from === "string") {
      conditions.push(gte(transactions.date, new Date(from)));
    }
    if (to && typeof to === "string") {
      conditions.push(lte(transactions.date, new Date(to)));
    }

    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Fetch page
    const rows = await db
      .select()
      .from(transactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(Number(count) / limit);

    res.json({
      transactions: rows.map((r) => ({
        id: r.id,
        merchant: r.merchant,
        category: r.category,
        kind: r.kind as TxKind,
        amount: parseFloat(r.amount),
        date: r.date.toISOString(),
        account: r.account,
        note: r.note,
        createdAt: r.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const found = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (found.length === 0) {
      throw notFoundError("Transação");
    }

    const r = found[0]!;
    res.json({
      transaction: {
        id: r.id,
        merchant: r.merchant,
        category: r.category,
        kind: r.kind as TxKind,
        amount: parseFloat(r.amount),
        date: r.date.toISOString(),
        account: r.account,
        note: r.note,
        createdAt: r.createdAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const body = req.body as UpdateTxBody;

    const updates: Record<string, unknown> = {};

    if (body.merchant !== undefined) {
      if (body.merchant.trim().length === 0) {
        throw validationError("Nome do estabelecimento não pode ser vazio.");
      }
      updates.merchant = body.merchant.trim();
    }

    if (body.category !== undefined) {
      if (body.category.trim().length === 0) {
        throw validationError("Categoria não pode ser vazia.");
      }
      updates.category = body.category.trim();
    }

    if (body.kind !== undefined) {
      updates.kind = validateKind(body.kind);
    }

    if (body.amount !== undefined) {
      updates.amount = parseAmount(body.amount).toString();
    }

    if (body.date !== undefined) {
      const d = new Date(body.date);
      if (isNaN(d.getTime())) {
        throw validationError("Data inválida.");
      }
      updates.date = d;
    }

    if (body.account !== undefined) {
      updates.account = body.account.trim() || null;
    }

    if (body.note !== undefined) {
      updates.note = body.note.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      throw validationError("Nenhum campo para atualizar.");
    }

    const db = getDb();
    const [updated] = await db
      .update(transactions)
      .set({ ...updates })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    if (!updated) {
      throw notFoundError("Transação");
    }

    res.json({
      transaction: {
        id: updated.id,
        merchant: updated.merchant,
        category: updated.category,
        kind: updated.kind as TxKind,
        amount: parseFloat(updated.amount),
        date: updated.date.toISOString(),
        account: updated.account,
        note: updated.note,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const db = getDb();
    const result = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw notFoundError("Transação");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Helper for OR condition
function or(...conditions: (typeof transactions.merchant)[]): ReturnType<typeof like> | undefined {
  // Simple search on merchant only for this implementation
  return like(transactions.merchant, "%");
}

export async function getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const db = getDb();

    // Get all transactions for the user
    const allTx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    // Calculate totals
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;

    for (const tx of allTx) {
      const amount = parseFloat(tx.amount);
      if (tx.kind === "income") {
        totalIncome += amount;
        if (tx.date >= currentMonthStart) {
          currentMonthIncome += amount;
        }
      } else if (tx.kind === "expense") {
        totalExpense += amount;
        if (tx.date >= currentMonthStart) {
          currentMonthExpense += amount;
        }
      }
    }

    const netWorth = totalIncome - totalExpense;

    // Monthly aggregation (last 6 months)
    const monthly: Array<{ m: string; income: number; expense: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      let mIncome = 0;
      let mExpense = 0;

      for (const tx of allTx) {
        if (tx.date >= monthStart && tx.date < monthEnd) {
          const amount = parseFloat(tx.amount);
          if (tx.kind === "income") mIncome += amount;
          else if (tx.kind === "expense") mExpense += amount;
        }
      }

      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      monthly.push({
        m: monthNames[d.getMonth()]!,
        income: mIncome,
        expense: mExpense,
      });
    }

    // Recent transactions (last 4)
    const recent = allTx.slice(0, 4).map((tx) => ({
      id: tx.id,
      merchant: tx.merchant,
      category: tx.category,
      kind: tx.kind as TxKind,
      amount: parseFloat(tx.amount),
      date: tx.date.toISOString(),
      account: tx.account,
      note: tx.note,
    }));

    // Upcoming bills (next 30 days from expense transactions)
    const upcoming = allTx
      .filter((tx) => tx.kind === "expense" && tx.date > now && tx.date < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
      .slice(0, 3)
      .map((tx) => ({
        title: tx.merchant,
        due: tx.date.toISOString(),
        amount: parseFloat(tx.amount),
      }));

    res.json({
      dashboard: {
        netWorth,
        income: currentMonthIncome,
        expenses: currentMonthExpense,
        monthly,
        recent,
        upcoming,
      },
    });
  } catch (err) {
    next(err);
  }
}
