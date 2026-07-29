import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TxKind } from "@/lib/finance-data";

export type Account = {
  id: string;
  name: string;
  kind: string;
  balance: number;
};
export type Card = {
  id: string;
  name: string;
  brand: string;
  last4: string;
  card_limit: number;
  used: number;
  due_day: number;
  color: string | null;
};
export type Category = {
  id: string;
  name: string;
  icon: string;
  budget_limit: number;
};
export type Goal = { id: string; title: string; saved: number; target: number };
export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  icon: string;
  amount: number;
  kind: TxKind;
  occurred_at: string;
  note: string | null;
  account_id: string | null;
};

const num = (v: unknown) => Number(v ?? 0);

export function useAccounts(enabled = true) {
  return useQuery({
    queryKey: ["accounts"],
    enabled,
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, name, kind, balance")
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((a) => ({ ...a, balance: num(a.balance) }));
    },
  });
}

export function useCards(enabled = true) {
  return useQuery({
    queryKey: ["cards"],
    enabled,
    queryFn: async (): Promise<Card[]> => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, name, brand, last4, card_limit, used, due_day, color")
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((c) => ({
        ...c,
        card_limit: num(c.card_limit),
        used: num(c.used),
      }));
    },
  });
}

export function useCategories(enabled = true) {
  return useQuery({
    queryKey: ["categories"],
    enabled,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, icon, budget_limit")
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((c) => ({
        ...c,
        budget_limit: num(c.budget_limit),
      }));
    },
  });
}

export function useGoals(enabled = true) {
  return useQuery({
    queryKey: ["goals"],
    enabled,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from("goals")
        .select("id, title, saved, target")
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((g) => ({
        ...g,
        saved: num(g.saved),
        target: num(g.target),
      }));
    },
  });
}

export function useTransactions(enabled = true) {
  return useQuery({
    queryKey: ["transactions"],
    enabled,
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, merchant, category, icon, amount, kind, occurred_at, note, account_id",
        )
        .order("occurred_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map((t) => ({
        ...t,
        amount: num(t.amount),
        kind: t.kind as TxKind,
      }));
    },
  });
}

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: ["profile"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, avatar_initials")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (keys: string[]) =>
    keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export function useCreateTransaction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      merchant: string;
      category: string;
      icon: string;
      amount: number;
      kind: TxKind;
      account_id: string | null;
      note?: string | null;
    }) => {
      const user_id = await currentUserId();
      const { error } = await supabase
        .from("transactions")
        .insert({ ...input, user_id });
      if (error) throw error;
    },
    onSuccess: () => invalidate(["transactions", "accounts"]),
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: Partial<Transaction> & { id: string }) => {
      const { error } = await supabase
        .from("transactions")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(["transactions"]),
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(["transactions"]),
  });
}

export function useCreateAccount() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { name: string; kind: string; balance: number }) => {
      const user_id = await currentUserId();
      const { error } = await supabase.from("accounts").insert({ ...input, user_id });
      if (error) throw error;
    },
    onSuccess: () => invalidate(["accounts"]),
  });
}

export function useDeleteAccount() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(["accounts", "transactions"]),
  });
}

export function useCreateCard() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      brand: string;
      last4: string;
      card_limit: number;
      used: number;
      due_day: number;
      color: string;
    }) => {
      const user_id = await currentUserId();
      const { error } = await supabase.from("cards").insert({ ...input, user_id });
      if (error) throw error;
    },
    onSuccess: () => invalidate(["cards"]),
  });
}

export function useDeleteCard() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(["cards"]),
  });
}

export function useCreateGoal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { title: string; target: number; saved: number }) => {
      const user_id = await currentUserId();
      const { error } = await supabase.from("goals").insert({ ...input, user_id });
      if (error) throw error;
    },
    onSuccess: () => invalidate(["goals"]),
  });
}

export function useDeleteGoal() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(["goals"]),
  });
}
