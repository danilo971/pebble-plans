import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MobileShell } from "@/components/finance/MobileShell";
import { currency, dateLabel, iconFor } from "@/lib/finance-data";
import { useAuth } from "@/hooks/use-auth";
import {
  useAccounts,
  useDeleteTransaction,
  useTransactions,
} from "@/lib/finance-queries";
import type { Transaction } from "@/lib/finance-queries";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Extrato — Cifra" },
      { name: "description", content: "Todas as suas movimentações financeiras em um só lugar." },
      { property: "og:title", content: "Extrato — Cifra" },
      {
        property: "og:description",
        content: "Todas as suas movimentações financeiras em um só lugar.",
      },
    ],
  }),
  component: TransactionsPage,
});

const filters = ["Todos", "Entradas", "Saídas", "Transferências"] as const;

function TransactionsPage() {
  const { session } = useAuth();
  const on = !!session;
  const { data: transactions = [] } = useTransactions(on);
  const { data: accounts = [] } = useAccounts(on);
  const remove = useDeleteTransaction();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");

  const groups = useMemo(() => {
    const kindOf: Record<string, string> = {
      Entradas: "income",
      Saídas: "expense",
      Transferências: "transfer",
    };
    const q = query.trim().toLowerCase();
    const list = transactions.filter((t) => {
      if (filter !== "Todos" && t.kind !== kindOf[filter]) return false;
      if (!q) return true;
      return (
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    });
    return list.reduce<Record<string, Transaction[]>>((acc, t) => {
      const key = dateLabel(t.occurred_at).split(",")[0];
      (acc[key] ||= []).push(t);
      return acc;
    }, {});
  }, [transactions, query, filter]);

  async function del(id: string) {
    try {
      await remove.mutateAsync(id);
      toast.success("Transação excluída");
    } catch (e) {
      toast.error("Não foi possível excluir", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  return (
    <MobileShell>
      <header className="glass sticky top-0 z-40 flex items-center gap-3 px-5 pb-4 pt-6">
        <Link
          to="/"
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-surface"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="flex-1 text-lg font-semibold tracking-tight">Extrato</h1>
        <button
          aria-label="Filtros"
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-surface"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </header>

      <div className="px-5">
        <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/[0.06] bg-card px-4">
          <Search className="size-4 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por categoria, valor, conta…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-9 shrink-0 rounded-full border px-4 text-xs font-medium ${
                filter === f
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-white/10 bg-surface text-white/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6 px-5">
        {Object.keys(groups).length === 0 && (
          <p className="text-xs text-white/40">Nenhuma movimentação encontrada.</p>
        )}
        {Object.entries(groups).map(([date, list]) => {
          const total = list.reduce(
            (s, t) => s + (t.kind === "income" ? t.amount : -t.amount),
            0
          );
          return (
            <section key={date}>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                  {date}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    total >= 0 ? "text-accent" : "text-white/60"
                  }`}
                >
                  {total >= 0 ? "+" : "−"}
                  {currency(Math.abs(total))}
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card">
                {list.map((t, idx) => {
                  const Icon = iconFor(t.icon);
                  const positive = t.kind === "income";
                  const accountName =
                    accounts.find((a) => a.id === t.account_id)?.name ?? "—";
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-4 px-4 py-3.5 ${
                        idx > 0 ? "border-t border-white/[0.04]" : ""
                      }`}
                    >
                      <div
                        className={`grid size-10 shrink-0 place-items-center rounded-full ${
                          positive
                            ? "bg-accent/10 text-accent"
                            : "bg-surface text-white/70"
                        }`}
                      >
                        <Icon className="size-[18px]" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.merchant}</p>
                        <p className="text-[11px] text-white/40">
                          {t.category} • {accountName}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          positive ? "text-accent" : "text-white"
                        }`}
                      >
                        {positive ? "+" : "−"}
                        {currency(t.amount)}
                      </p>
                      <button
                        onClick={() => del(t.id)}
                        aria-label={`Excluir ${t.merchant}`}
                        className="grid size-8 place-items-center rounded-full text-white/30 active:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </MobileShell>
  );
}
