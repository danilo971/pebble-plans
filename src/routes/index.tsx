import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/finance/MobileShell";
import { Sparkline } from "@/components/finance/Sparkline";
import {
  currency,
  transactions,
  monthly,
  upcoming,
  goals,
} from "@/lib/finance-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cifra — Controle financeiro pessoal" },
      {
        name: "description",
        content:
          "Cifra: gerencie receitas, despesas, cartões e metas em um app financeiro premium e minimalista.",
      },
      { property: "og:title", content: "Cifra — Controle financeiro pessoal" },
      {
        property: "og:description",
        content:
          "Cifra: gerencie receitas, despesas, cartões e metas em um app financeiro premium e minimalista.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [visible, setVisible] = useState(true);
  const netWorth = 142850;
  const income = 12400;
  const expenses = 5120;
  const sparkData = monthly.map((m) => m.income - m.expense);
  const recent = transactions.slice(0, 4);

  return (
    <MobileShell>
      {/* Header */}
      <header className="glass sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 pb-4 pt-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/40 to-info/30 text-sm font-semibold text-white ring-1 ring-white/10"
          >
            MS
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
              Bem-vindo
            </p>
            <h2 className="truncate text-sm font-semibold">Marcus Silva</h2>
          </div>
        </div>
        <button
          aria-label="Notificações"
          className="relative grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-surface"
        >
          <Bell className="size-4 text-white/80" />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
        </button>
      </header>

      {/* Balance card */}
      <section className="px-5 pt-2 animate-float-in">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-surface to-card p-6">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 size-52 rounded-full bg-accent/15 blur-[80px]"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/50">Patrimônio total</p>
            <button
              onClick={() => setVisible((v) => !v)}
              className="grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/5"
              aria-label={visible ? "Ocultar valores" : "Mostrar valores"}
            >
              {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
          </div>
          <h1 className="mt-1 text-[40px] font-semibold leading-tight tracking-tight">
            {visible ? currency(netWorth) : "R$ ••••••"}
          </h1>

          <div className="mt-5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 font-medium text-accent">
              <TrendingUp className="size-3" />
              +8,2%
            </span>
            <span className="text-white/40">vs. mês anterior</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
                Entradas
              </p>
              <p className="text-lg font-semibold leading-none text-accent">
                +{currency(income)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
                Saídas
              </p>
              <p className="text-lg font-semibold leading-none text-danger">
                −{currency(expenses)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-5 flex gap-2 overflow-x-auto px-5 no-scrollbar">
        <Link
          to="/add"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground active:scale-95"
        >
          <ArrowDownRight className="size-4" /> Adicionar
        </Link>
        <button className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-surface px-5 text-sm font-medium">
          <ArrowUpRight className="size-4" /> Despesa
        </button>
        <button className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-surface px-5 text-sm font-medium">
          <ArrowRightLeft className="size-4" /> Transferir
        </button>
      </section>

      {/* Fluxo */}
      <section className="mt-8 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-semibold tracking-tight">Fluxo financeiro</h3>
          <span className="text-xs font-medium text-info">Ver relatórios</span>
        </div>
        <div className="rounded-3xl border border-white/[0.06] bg-card p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Economia do mês
              </p>
              <p className="text-2xl font-semibold text-accent">
                +{currency(income - expenses)}
              </p>
            </div>
            <div className="flex gap-1 text-[10px] font-medium text-white/40">
              {["Sem", "Mês", "Ano"].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-full px-2.5 py-1 ${
                    i === 1 ? "bg-white/10 text-white" : ""
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-20 text-accent">
            <Sparkline data={sparkData} className="h-full w-full" />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/40">
            {monthly.map((m) => (
              <span key={m.m}>{m.m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Insight */}
      <section className="mt-6 px-5">
        <div className="flex gap-3 rounded-3xl border border-accent/20 bg-accent/[0.06] p-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0 text-sm">
            <p className="font-medium">Você gastou 18% menos com delivery</p>
            <p className="mt-0.5 text-xs text-white/50">
              Continue assim e economize R$ 240 até o fim do mês.
            </p>
          </div>
        </div>
      </section>

      {/* Metas */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between px-5">
          <h3 className="text-base font-semibold tracking-tight">Metas ativas</h3>
          <button className="text-xs font-medium text-white/50">Ver todas</button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
            return (
              <div
                key={g.title}
                className="min-w-[190px] rounded-3xl border border-white/[0.06] bg-card p-4"
              >
                <p className="text-xs text-white/50">{g.title}</p>
                <p className="mt-1 text-lg font-semibold">
                  {currency(g.saved)}
                  <span className="ml-1 text-xs font-normal text-white/40">
                    / {currency(g.target)}
                  </span>
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-accent shadow-[0_0_10px_var(--accent)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] font-medium text-accent">{pct}% concluído</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Próximos vencimentos */}
      <section className="mt-8 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-semibold tracking-tight">Próximos vencimentos</h3>
        </div>
        <div className="divide-y divide-white/[0.05] overflow-hidden rounded-3xl border border-white/[0.06] bg-card">
          {upcoming.map((u) => (
            <div key={u.title} className="flex items-center gap-3 px-4 py-3.5">
              <div className="grid size-9 place-items-center rounded-xl bg-warning/10 text-warning">
                <Bell className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.title}</p>
                <p className="text-[11px] text-white/40">Vence {u.due}</p>
              </div>
              <p className="text-sm font-semibold">{currency(u.amount)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Atividade recente */}
      <section className="mt-8 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-semibold tracking-tight">Atividade recente</h3>
          <Link to="/transactions" className="inline-flex items-center gap-0.5 text-xs font-medium text-white/50">
            Ver tudo <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="space-y-1">
          {recent.map((t) => {
            const Icon = t.icon;
            const positive = t.kind === "income";
            return (
              <div
                key={t.id}
                className="flex items-center gap-4 rounded-2xl p-3 transition-colors active:bg-surface"
              >
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-full border ${
                    positive
                      ? "border-accent/20 bg-accent/10 text-accent"
                      : "border-white/[0.06] bg-surface text-white/70"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.merchant}</p>
                  <p className="text-[11px] text-white/40">
                    {t.category} • {t.date}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      positive ? "text-accent" : "text-white"
                    }`}
                  >
                    {positive ? "+" : "−"}
                    {currency(t.amount)}
                  </p>
                  <p className="text-[10px] tracking-wide text-white/30">{t.account}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </MobileShell>
  );
}
