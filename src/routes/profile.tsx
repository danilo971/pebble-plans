import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
  Fingerprint,
  Bell,
  Download,
  Upload,
  HelpCircle,
  Globe,
  Shield,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MobileShell } from "@/components/finance/MobileShell";
import { accounts, currency } from "@/lib/finance-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Cifra" },
      { name: "description", content: "Sua conta, segurança e preferências." },
    ],
  }),
  component: ProfilePage,
});

type Row = { icon: LucideIcon; label: string; hint?: string; danger?: boolean };

const sections: { title: string; rows: Row[] }[] = [
  {
    title: "Segurança",
    rows: [
      { icon: Fingerprint, label: "Biometria e PIN", hint: "Ativado" },
      { icon: Shield, label: "Privacidade" },
    ],
  },
  {
    title: "Preferências",
    rows: [
      { icon: Bell, label: "Notificações" },
      { icon: Globe, label: "Idioma & moeda", hint: "Português • BRL" },
    ],
  },
  {
    title: "Dados",
    rows: [
      { icon: Download, label: "Exportar (PDF, CSV)" },
      { icon: Upload, label: "Importar movimentações" },
    ],
  },
  {
    title: "Ajuda",
    rows: [
      { icon: HelpCircle, label: "Central de ajuda" },
      { icon: LogOut, label: "Sair da conta", danger: true },
    ],
  },
];

function ProfilePage() {
  const total = accounts.reduce((s, a) => s + a.balance, 0);

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
        <h1 className="flex-1 text-lg font-semibold tracking-tight">Perfil</h1>
      </header>

      {/* Identity */}
      <section className="flex flex-col items-center px-5 pb-2 pt-2 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-accent/40 to-info/30 text-2xl font-semibold ring-1 ring-white/10">
          MS
        </div>
        <h2 className="mt-3 text-lg font-semibold">Marcus Silva</h2>
        <p className="text-xs text-white/50">marcus@cifra.app</p>
      </section>

      {/* Accounts */}
      <section className="mt-6 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-semibold tracking-tight">Contas & carteira</h3>
          <p className="text-xs font-medium text-white/50">Total {currency(total)}</p>
        </div>
        <div className="divide-y divide-white/[0.05] overflow-hidden rounded-3xl border border-white/[0.06] bg-card">
          {accounts.map((a) => (
            <div key={a.name} className="flex items-center gap-3 px-4 py-4">
              <div className="grid size-9 place-items-center rounded-xl bg-surface text-white/70">
                <ChevronRight className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="text-[11px] text-white/40">{a.kind}</p>
              </div>
              <p className="text-sm font-semibold">{currency(a.balance)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Settings */}
      {sections.map((s) => (
        <section key={s.title} className="mt-6 px-5">
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-white/40">
            {s.title}
          </p>
          <div className="divide-y divide-white/[0.05] overflow-hidden rounded-3xl border border-white/[0.06] bg-card">
            {s.rows.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.label}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface ${
                    r.danger ? "text-danger" : ""
                  }`}
                >
                  <div
                    className={`grid size-9 place-items-center rounded-xl ${
                      r.danger ? "bg-danger/10 text-danger" : "bg-surface text-white/70"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{r.label}</span>
                  {r.hint && <span className="text-xs text-white/40">{r.hint}</span>}
                  {!r.danger && <ChevronRight className="size-4 text-white/30" />}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <p className="mt-8 pb-4 text-center text-[10px] text-white/30">
        Cifra • versão 1.0.0
      </p>
    </MobileShell>
  );
}
