import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  Plus,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { MobileShell } from "@/components/finance/MobileShell";
import { currency } from "@/lib/finance-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useProfile,
} from "@/lib/finance-queries";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Cifra" },
      { name: "description", content: "Sua conta, segurança e preferências." },
      { property: "og:title", content: "Perfil — Cifra" },
      {
        property: "og:description",
        content: "Sua conta, segurança e preferências no Cifra.",
      },
    ],
  }),
  component: ProfilePage,
});

type Row = {
  icon: LucideIcon;
  label: string;
  hint?: string;
  danger?: boolean;
  action?: () => void;
};

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const on = !!session;
  const { data: profile } = useProfile(on);
  const { data: accounts = [] } = useAccounts(on);
  const createAccount = useCreateAccount();
  const removeAccount = useDeleteAccount();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", kind: "Conta corrente", balance: "" });

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function submitAccount() {
    if (!form.name.trim()) {
      toast.error("Informe o nome da conta");
      return;
    }
    try {
      await createAccount.mutateAsync({
        name: form.name.trim(),
        kind: form.kind || "Conta corrente",
        balance: Number(form.balance || 0),
      });
      setForm({ name: "", kind: "Conta corrente", balance: "" });
      setOpen(false);
      toast.success("Conta adicionada");
    } catch (e) {
      toast.error("Não foi possível salvar a conta", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

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
        { icon: LogOut, label: "Sair da conta", danger: true, action: signOut },
      ],
    },
  ];

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
          {profile?.avatar_initials || "CF"}
        </div>
        <h2 className="mt-3 text-lg font-semibold">{profile?.name || "Você"}</h2>
        <p className="text-xs text-white/50">{profile?.email || session?.user.email}</p>
      </section>

      {/* Accounts */}
      <section className="mt-6 px-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-base font-semibold tracking-tight">Contas & carteira</h3>
          <p className="text-xs font-medium text-white/50">Total {currency(total)}</p>
        </div>
        <div className="divide-y divide-white/[0.05] overflow-hidden rounded-3xl border border-white/[0.06] bg-card">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-4">
              <div className="grid size-9 place-items-center rounded-xl bg-surface text-white/70">
                <ChevronRight className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="text-[11px] text-white/40">{a.kind}</p>
              </div>
              <p className="text-sm font-semibold">{currency(a.balance)}</p>
              <button
                onClick={() => removeAccount.mutate(a.id)}
                aria-label={`Remover ${a.name}`}
                className="grid size-8 place-items-center rounded-full text-white/30 active:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm text-white/60"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-surface text-white/70">
              <Plus className="size-4" />
            </div>
            {open ? "Cancelar" : "Adicionar conta"}
          </button>
        </div>

        {open && (
          <div className="mt-2 space-y-2 rounded-3xl border border-white/[0.06] bg-card p-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome da conta"
              className="h-11 w-full rounded-2xl border border-white/[0.06] bg-surface px-3 text-sm placeholder:text-white/30 focus:outline-none"
            />
            <input
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              placeholder="Tipo (ex.: Conta digital)"
              className="h-11 w-full rounded-2xl border border-white/[0.06] bg-surface px-3 text-sm placeholder:text-white/30 focus:outline-none"
            />
            <input
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              inputMode="decimal"
              placeholder="Saldo inicial"
              className="h-11 w-full rounded-2xl border border-white/[0.06] bg-surface px-3 text-sm placeholder:text-white/30 focus:outline-none"
            />
            <button
              onClick={submitAccount}
              disabled={createAccount.isPending}
              className="h-11 w-full rounded-full bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              Salvar conta
            </button>
          </div>
        )}
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
                  onClick={r.action}
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
