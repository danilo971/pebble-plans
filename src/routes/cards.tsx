import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Wifi, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MobileShell } from "@/components/finance/MobileShell";
import { currency } from "@/lib/finance-data";
import { useAuth } from "@/hooks/use-auth";
import { useCards, useCreateCard, useDeleteCard } from "@/lib/finance-queries";

export const Route = createFileRoute("/cards")({
  head: () => ({
    meta: [
      { title: "Cartões — Cifra" },
      { name: "description", content: "Gerencie seus cartões, faturas e limites." },
      { property: "og:title", content: "Cartões — Cifra" },
      {
        property: "og:description",
        content: "Gerencie seus cartões, faturas e limites no Cifra.",
      },
    ],
  }),
  component: CardsPage,
});

const PALETTE = [
  "from-violet-600/40 via-fuchsia-500/20 to-transparent",
  "from-slate-500/40 via-slate-400/20 to-transparent",
  "from-orange-600/40 via-amber-500/20 to-transparent",
];

function CardsPage() {
  const { session } = useAuth();
  const { data: cards = [] } = useCards(!!session);
  const create = useCreateCard();
  const remove = useDeleteCard();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "Visa",
    last4: "",
    card_limit: "",
    used: "",
    due_day: "",
  });

  async function submit() {
    if (!form.name.trim() || !form.card_limit) {
      toast.error("Informe nome e limite do cartão");
      return;
    }
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        brand: form.brand || "Visa",
        last4: (form.last4 || "0000").slice(-4),
        card_limit: Number(form.card_limit),
        used: Number(form.used || 0),
        due_day: Math.min(31, Math.max(1, Number(form.due_day || 1))),
        color: PALETTE[cards.length % PALETTE.length],
      });
      setForm({ name: "", brand: "Visa", last4: "", card_limit: "", used: "", due_day: "" });
      setOpen(false);
      toast.success("Cartão adicionado");
    } catch (e) {
      toast.error("Não foi possível salvar o cartão", {
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
        <h1 className="flex-1 text-lg font-semibold tracking-tight">Cartões</h1>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Adicionar cartão"
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-surface"
        >
          <Plus className="size-4" />
        </button>
      </header>

      {open && (
        <div className="mx-5 mb-6 space-y-2 rounded-3xl border border-white/[0.06] bg-card p-4">
          {(
            [
              ["name", "Nome do cartão"],
              ["brand", "Bandeira"],
              ["last4", "4 últimos dígitos"],
              ["card_limit", "Limite"],
              ["used", "Fatura atual"],
              ["due_day", "Dia do vencimento"],
            ] as const
          ).map(([key, label]) => (
            <input
              key={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={label}
              className="h-11 w-full rounded-2xl border border-white/[0.06] bg-surface px-3 text-sm placeholder:text-white/30 focus:outline-none"
            />
          ))}
          <button
            onClick={submit}
            disabled={create.isPending}
            className="h-11 w-full rounded-full bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            Salvar cartão
          </button>
        </div>
      )}

      <div className="space-y-6 px-5">
        {cards.length === 0 && !open && (
          <p className="text-xs text-white/40">Nenhum cartão cadastrado ainda.</p>
        )}
        {cards.map((c) => {
          const pct = c.card_limit ? Math.round((c.used / c.card_limit) * 100) : 0;
          return (
            <article
              key={c.id}
              className="animate-float-in overflow-hidden rounded-3xl border border-white/[0.06] bg-card"
            >
              <div
                className={`relative h-44 overflow-hidden bg-gradient-to-br ${
                  c.color ?? PALETTE[0]
                } p-5`}
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
                          dia {c.due_day.toString().padStart(2, "0")}
                        </p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-white/80">
                        {c.brand}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                      {currency(c.card_limit)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${
                      pct > 80 ? "bg-danger" : "bg-accent"
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-white/50">
                    {pct}% do limite utilizado
                  </p>
                  <button
                    onClick={() => remove.mutate(c.id)}
                    aria-label={`Remover ${c.name}`}
                    className="inline-flex items-center gap-1 text-[11px] text-white/30 active:text-danger"
                  >
                    <Trash2 className="size-3.5" /> Remover
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </MobileShell>
  );
}
