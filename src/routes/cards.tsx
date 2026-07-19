import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Wifi } from "lucide-react";
import { MobileShell } from "@/components/finance/MobileShell";
import { cards, currency } from "@/lib/finance-data";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "Cartões — Cifra" },
      { name: "description", content: "Gerencie seus cartões, faturas e limites." },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
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
        <h1 className="flex-1 text-lg font-semibold tracking-tight">Cartões</h1>
        <button
          aria-label="Adicionar cartão"
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-surface"
        >
          <Plus className="size-4" />
        </button>
      </header>

      <div className="space-y-6 px-5">
        {cards.map((c) => {
          const pct = Math.round((c.used / c.limit) * 100);
          return (
            <article
              key={c.id}
              className="animate-float-in overflow-hidden rounded-3xl border border-white/[0.06] bg-card"
            >
              {/* Card visual */}
              <div
                className={`relative h-44 overflow-hidden bg-gradient-to-br ${c.color} p-5`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-white/70">{c.name}</p>
                    <Wifi className="size-4 rotate-90 text-white/70" />
                  </div>
                  <div>
                    <p className="font-mono text-lg tracking-widest text-white/90">
                      •••• {c.last4}
                    </p>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-white/50">
                          Vencimento
                        </p>
                        <p className="text-xs font-semibold">
                          dia {c.dueDay.toString().padStart(2, "0")}
                        </p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-white/80">
                        {c.brand}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">
                      Fatura atual
                    </p>
                    <p className="mt-1 text-xl font-semibold">{currency(c.used)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/40">
                      Limite
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/70">
                      {currency(c.limit)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${
                      pct > 80 ? "bg-danger" : "bg-accent"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/50">
                  {pct}% do limite utilizado
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </MobileShell>
  );
}
