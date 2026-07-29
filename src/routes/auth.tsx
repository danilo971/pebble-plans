import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Cifra" },
      {
        name: "description",
        content: "Acesse sua conta Cifra para gerenciar receitas, despesas e metas.",
      },
      { property: "og:title", content: "Entrar — Cifra" },
      {
        property: "og:description",
        content: "Acesse sua conta Cifra para gerenciar receitas, despesas e metas.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Conta criada", { description: "Você já pode usar o Cifra." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error("Não foi possível continuar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
    } catch (err) {
      toast.error("Falha no login com Google", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    }
  }

  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6 py-10">
        <div className="animate-float-in">
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
            Cifra
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {mode === "signin" ? "Bem-vindo de volta" : "Criar sua conta"}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Controle financeiro pessoal, simples e privado.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-2">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                className="h-14 w-full rounded-2xl border border-white/[0.06] bg-card px-4 text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="E-mail"
              autoComplete="email"
              className="h-14 w-full rounded-2xl border border-white/[0.06] bg-card px-4 text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
              placeholder="Senha"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="h-14 w-full rounded-2xl border border-white/[0.06] bg-card px-4 text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 active:scale-[0.98] disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            onClick={google}
            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-surface text-sm font-medium"
          >
            Continuar com Google
          </button>

          <p className="mt-6 text-center text-xs text-white/50">
            {mode === "signin" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-accent"
            >
              {mode === "signin" ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
