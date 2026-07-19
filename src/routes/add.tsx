import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Camera, Tag, Wallet, Check } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/finance/MobileShell";
import { categories } from "@/lib/finance-data";
import { toast } from "sonner";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Nova transação — Cifra" },
      { name: "description", content: "Registre receitas e despesas em segundos." },
    ],
  }),
  component: AddTransactionPage,
});

const kinds = [
  { id: "expense", label: "Despesa" },
  { id: "income", label: "Receita" },
  { id: "transfer", label: "Transferência" },
] as const;

function AddTransactionPage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0].name);
  const [note, setNote] = useState("");

  const displayAmount = amount ? formatBRL(amount) : "0,00";
  const accent =
    kind === "income" ? "text-accent" : kind === "expense" ? "text-danger" : "text-info";

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
        <h1 className="flex-1 text-lg font-semibold tracking-tight">Nova transação</h1>
      </header>

      <div className="px-5">
        <div className="inline-flex w-full rounded-full border border-white/10 bg-surface p-1">
          {kinds.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              className={`h-9 flex-1 rounded-full text-xs font-semibold transition-colors ${
                kind === k.id
                  ? "bg-accent text-accent-foreground"
                  : "text-white/60"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            Valor
          </p>
          <div className={`mt-2 flex items-baseline justify-center gap-1 ${accent}`}>
            <span className="text-xl font-medium">R$</span>
            <span className="text-5xl font-semibold tracking-tight tabular-nums">
              {displayAmount}
            </span>
          </div>

          {/* Numpad */}
          <div className="mt-8 grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map((k) => (
              <button
                key={k}
                onClick={() => {
                  setAmount((prev) => {
                    if (k === "⌫") return prev.slice(0, -1);
                    if (k === "." && prev.includes(".")) return prev;
                    if (prev.length >= 9) return prev;
                    return prev + k;
                  });
                }}
                className="h-14 rounded-2xl border border-white/[0.06] bg-card text-xl font-medium text-white/90 transition-colors active:bg-surface"
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="mt-6 space-y-2">
          <Field icon={<Tag className="size-4" />} label="Categoria">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.slice(0, 8).map((c) => {
                const Icon = c.icon;
                const active = category === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setCategory(c.name)}
                    className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-white/10 text-white/70"
                    }`}
                  >
                    <Icon className="size-3.5" /> {c.name}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field icon={<Wallet className="size-4" />} label="Conta">
            <span className="text-sm font-medium">Nubank Ultravioleta</span>
          </Field>

          <Field icon={<Calendar className="size-4" />} label="Data">
            <span className="text-sm font-medium">Hoje, 20 Mar</span>
          </Field>

          <div className="rounded-2xl border border-white/[0.06] bg-card p-4">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
              Observação
            </p>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex.: jantar com clientes"
              className="w-full bg-transparent text-sm placeholder:text-white/30 focus:outline-none"
            />
          </div>

          <button className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-card/50 p-4 text-sm text-white/60">
            <Camera className="size-4" /> Anexar comprovante
          </button>
        </div>

        <button
          onClick={() => {
            toast.success("Transação registrada", {
              description: category + " • R$ " + displayAmount,
            });
            navigate({ to: "/" });
          }}
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 active:scale-[0.98]"
        >
          <Check className="size-5" strokeWidth={2.5} /> Salvar transação
        </button>
      </div>
    </MobileShell>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-widest">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function formatBRL(raw: string) {
  // raw is what user typed with digits and possibly one '.'
  const [int, dec = ""] = raw.split(".");
  const intFmt = (int || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (raw.includes(".")) return `${intFmt},${dec.padEnd(2, "0").slice(0, 2)}`;
  return `${intFmt},00`;
}
