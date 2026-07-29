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
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MobileShell } from "@/components/finance/MobileShell";
import { Sparkline } from "@/components/finance/Sparkline";
import { currency, dateLabel, iconFor, monthLabel } from "@/lib/finance-data";
import { useAuth } from "@/hooks/use-auth";
import {
  useAccounts,
  useCards,
  useCreateGoal,
  useGoals,
  useProfile,
  useTransactions,
} from "@/lib/finance-queries";

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
  const [goalForm, setGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const { session } = useAuth();
  const on = !!session;
  const { data: profile } = useProfile(on);
  const { data: accounts = [] } = useAccounts(on);
  const { data: cards = [] } = useCards(on);
  const { data: goals = [] } = useGoals(on);
  const { data: transactions = [] } = useTransactions(on);
  const createGoal = useCreateGoal();

  const stats = useMemo(() => {
    const now = new Date();
    const inMonth = (iso: string, offset: number) => {
      const d = new Date(iso);
      const ref = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return (
        d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
      );
    };
    const sum = (list: typeof transactions, kind: string) =>
      list.filter((t) => t.kind === kind).reduce((s, t) => s + t.amount, 0);

    const thisMonth = transactions.filter((t) => inMonth(t.occurred_at, 0));
    const lastMonth = transactions.filter((t) => inMonth(t.occurred_at, 1));

    const income = sum(thisMonth, "income");
    const expenses = sum(thisMonth, "expense");
    const prevNet = sum(lastMonth, "income") - sum(lastMonth, "expense");
    const net = income - expenses;
    const delta = prevNet !== 0 ? ((net - prevNet) / Math.abs(prevNet)) * 100 : 0;

    const monthly = Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      const ref = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const list = transactions.filter((t) => inMonth(t.occurred_at, offset));
      return {
        m: monthLabel(ref),
        income: sum(list, "income"),
        expense: sum(list, "expense"),
      };
    });

    const netWorth =
      accounts.reduce((s, a) => s + a.balance, 0) -
      cards.reduce((s, c) => s + c.used, 0);

    return { income, expenses, net, delta, monthly, netWorth };
  }, [transactions, accounts, cards]);

  const upcoming = useMemo(() => {
    const today = new Date();
    return cards
      .map((c) => {
        const due = new Date(today.getFullYear(), today.getMonth(), c.due_day);
        if (due < today) due.setMonth(due.getMonth() + 1);
        return { title: `Fatura ${c.name}`, due, amount: c.used };
      })
      .sort((a, b) => a.due.getTime() - b.due.getTime())
      .slice(0, 3);
  }, [cards]);

  const sparkData = stats.monthly.map((m) => m.income - m.expense);
  const recent = transactions.slice(0, 4);
  const initials = profile?.avatar_initials || "CF";

  async function submitGoal() {
    const target = Number(goalTarget.replace(",", "."));
    if (!goalTitle.trim() || !target) {
      toast.error("Informe título e valor da meta");
      return;
    }
    try {
      await createGoal.mutateAsync({ title: goalTitle.trim(), target, saved: 0 });
      setGoalTitle("");
      setGoalTarget("");
      setGoalForm(false);
      toast.success("Meta criada");
    } catch (e) {
      toast.error("Não foi possível criar a meta", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  return (
    <MobileShell>
      {/* Header */}
      <header className="glass sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 pb-4 pt-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent/40 to-info/30 text-sm font-semibold text-white ring-1 ring-white/10"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
              Bem-vindo
            </p>
            <h2 className="truncate text-sm font-semibold">
              {profile?.name || session?.user.email}
            </h2>
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
            {visible ? currency(stats.netWorth) : "R$ ••••••"}
          </h1>

          <div className="mt-5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 font-medium text-accent">
              <TrendingUp className="size-3" />
              {stats.delta >= 0 ? "+" : "−"}
              {Math.abs(stats.delta).toFixed(1).replace(".", ",")}%
            </span>
            <span className="text-white/40">vs. mês anterior</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
                Entradas
              </p>
              <p className="text-lg font-semibold leading-none text-accent">
                +{currency(stats.income)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-white/40">
                Saídas
              </p>
              <p className="text-lg font-semibold leading-none text-danger">
                −{currency(stats.expenses)}
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
        <Link
          to="/add"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-surface px-5 text-sm font-medium"
        >
          <ArrowUpRight className="size-4" /> Despesa
        </Link>
        <Link
          to="/add"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-surface px-5 text-sm font-medium"
        >
          <ArrowRightLeft className="size-4" /> Transferir
        </Link>
      </section>

      {/* Fluxo */}
      <section className="mt-8 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-semibold tracking-tight">Fluxo financeiro</h3>
          <Link to="/transactions" className="text-xs font-medium text-info">
            Ver relatórios
          </Link>
        </div>
        <div className="rounded-3xl border border-white/[0.06] bg-card p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Economia do mês
              </p>
              <p
                className={`text-2xl font-semibold ${
                  stats.net >= 0 ? "text-accent" : "text-danger"
                }`}
              >
                {stats.net >= 0 ? "+" : "−"}
                {currency(Math.abs(stats.net))}
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
            {stats.monthly.map((m) => (
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
            <p className="font-medium">
              {transactions.length
                ? `${transactions.length} movimentações registradas`
                : "Comece registrando sua primeira movimentação"}
            </p>
            <p className="mt-0.5 text-xs text-white/50">
              {stats.net >= 0
                ? `Você está economizando ${currency(Math.abs(stats.net))} neste mês.`
                : `Suas saídas superam as entradas em ${currency(Math.abs(stats.net))}.`}
            </p>
          </div>
        </div>
      </section>

      {/* Metas */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between px-5">
          <h3 className="text-base font-semibold tracking-tight">Metas ativas</h3>
          <button
            onClick={() => setGoalForm((v) => !v)}
            className="text-xs font-medium text-white/50"
          >
            {goalForm ? "Cancelar" : "Nova meta"}
          </button>
        </div>

        {goalForm && (
          <div className="mx-5 mb-3 space-y-2 rounded-3xl border border-white/[0.06] bg-card p-4">
            <input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Título da meta"
              className="h-11 w-full rounded-2xl border border-white/[0.06] bg-surface px-3 text-sm placeholder:text-white/30 focus:outline-none"
            />
            <input
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              inputMode="decimal"
              placeholder="Valor alvo (ex.: 18000)"
              className="h-11 w-full rounded-2xl border border-white/[0.06] bg-surface px-3 text-sm placeholder:text-white/30 focus:outline-none"
            />
            <button
              onClick={submitGoal}
              disabled={createGoal.isPending}
              className="h-11 w-full rounded-full bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              Salvar meta
            </button>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
          {goals.length === 0 && !goalForm && (
            <p className="text-xs text-white/40">Nenhuma meta cadastrada ainda.</p>
          )}
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
            return (
              <div
                key={g.id}
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
          {upcoming.length === 0 && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Link to="/cards" className="text-xs text-white/40">
                <Plus className="mr-1 inline size-3" /> Cadastre um cartão para ver
                vencimentos
              </Link>
            </div>
          )}
          {upcoming.map((u) => (
            <div key={u.title} className="flex items-center gap-3 px-4 py-3.5">
              <div className="grid size-9 place-items-center rounded-xl bg-warning/10 text-warning">
                <Bell className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.title}</p>
                <p className="text-[11px] text-white/40">
                  Vence {u.due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </p>
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
          {recent.length === 0 && (
            <p className="px-3 text-xs text-white/40">
              Nenhuma movimentação registrada ainda.
            </p>
          )}
          {recent.map((t) => {
            const Icon = iconFor(t.icon);
            const positive = t.kind === "income";
            const accountName =
              accounts.find((a) => a.id === t.account_id)?.name ?? "—";
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
                    {t.category} • {dateLabel(t.occurred_at)}
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
                  <p className="text-[10px] tracking-wide text-white/30">{accountName}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </MobileShell>
  );
}
