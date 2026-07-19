import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { MobileShell } from "@/components/finance/MobileShell";
import { currency, transactions } from "@/lib/finance-data";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Extrato — Cifra" },
      { name: "description", content: "Todas as suas movimentações financeiras em um só lugar." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  // Group by date label
  const groups = transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
    (acc[t.date] ||= []).push(t);
    return acc;
  }, {});

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
            placeholder="Buscar por categoria, valor, conta…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["Todos", "Entradas", "Saídas", "Cartão", "Pix"].map((f, i) => (
            <button
              key={f}
              className={`h-9 shrink-0 rounded-full border px-4 text-xs font-medium ${
                i === 0
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
                  const Icon = t.icon;
                  const positive = t.kind === "income";
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
                        <Icon className="size-4.5" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{t.merchant}</p>
                        <p className="text-[11px] text-white/40">
                          {t.category} • {t.account}
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
