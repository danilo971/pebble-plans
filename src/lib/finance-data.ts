import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Film,
  Briefcase,
  Heart,
  Plane,
  Zap,
  Wifi,
  GraduationCap,
  Gift,
  TrendingUp,
  Dog,
} from "lucide-react";

export type TxKind = "income" | "expense" | "transfer";

export const iconMap: Record<string, LucideIcon> = {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Film,
  Briefcase,
  Heart,
  Plane,
  Zap,
  Wifi,
  GraduationCap,
  Gift,
  TrendingUp,
  Dog,
};

export const iconFor = (name?: string | null): LucideIcon =>
  (name && iconMap[name]) || ShoppingBag;

export const currency = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v);

export const compactBRL = (v: number) =>
  "R$ " +
  new Intl.NumberFormat("pt-BR", {
    notation: v >= 10000 ? "compact" : "standard",
    maximumFractionDigits: v >= 10000 ? 1 : 2,
    minimumFractionDigits: v >= 10000 ? 0 : 2,
  }).format(v);

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const monthLabel = (d: Date) => MONTHS[d.getMonth()];

/** Rótulo de data no estilo "Hoje, 14:45" / "Ontem" / "12 Mar". */
export function dateLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (sameDay(d, now))
    return `Hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (sameDay(d, yesterday)) return "Ontem";
  return `${d.getDate().toString().padStart(2, "0")} ${MONTHS[d.getMonth()]}`;
}
