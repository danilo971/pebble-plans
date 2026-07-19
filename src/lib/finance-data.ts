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

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  icon: LucideIcon;
  amount: number;
  kind: TxKind;
  date: string;
  account: string;
};

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

export const transactions: Transaction[] = [
  {
    id: "1",
    merchant: "Pão de Açúcar",
    category: "Mercado",
    icon: ShoppingBag,
    amount: 412.5,
    kind: "expense",
    date: "Hoje, 14:45",
    account: "Nubank",
  },
  {
    id: "2",
    merchant: "iFood",
    category: "Alimentação",
    icon: Utensils,
    amount: 84.2,
    kind: "expense",
    date: "Hoje, 12:30",
    account: "Inter",
  },
  {
    id: "3",
    merchant: "Netflix Premium",
    category: "Streaming",
    icon: Film,
    amount: 55.9,
    kind: "expense",
    date: "Ontem",
    account: "Cartão XP",
  },
  {
    id: "4",
    merchant: "Projeto Freelance",
    category: "Trabalho",
    icon: Briefcase,
    amount: 2800,
    kind: "income",
    date: "12 Mar",
    account: "Itaú Pessoal",
  },
  {
    id: "5",
    merchant: "Posto Ipiranga",
    category: "Combustível",
    icon: Car,
    amount: 210,
    kind: "expense",
    date: "11 Mar",
    account: "Nubank",
  },
  {
    id: "6",
    merchant: "Aluguel",
    category: "Moradia",
    icon: Home,
    amount: 2400,
    kind: "expense",
    date: "10 Mar",
    account: "Itaú",
  },
  {
    id: "7",
    merchant: "Salário",
    category: "Trabalho",
    icon: Briefcase,
    amount: 9600,
    kind: "income",
    date: "05 Mar",
    account: "Itaú Pessoal",
  },
];

export const categories = [
  { name: "Mercado", icon: ShoppingBag, spent: 812, limit: 1200 },
  { name: "Alimentação", icon: Utensils, spent: 640, limit: 800 },
  { name: "Transporte", icon: Car, spent: 380, limit: 500 },
  { name: "Moradia", icon: Home, spent: 2400, limit: 2400 },
  { name: "Streaming", icon: Film, spent: 89, limit: 150 },
  { name: "Saúde", icon: Heart, spent: 120, limit: 400 },
  { name: "Viagem", icon: Plane, spent: 0, limit: 1000 },
  { name: "Energia", icon: Zap, spent: 210, limit: 300 },
  { name: "Internet", icon: Wifi, spent: 120, limit: 120 },
  { name: "Educação", icon: GraduationCap, spent: 199, limit: 300 },
  { name: "Presentes", icon: Gift, spent: 0, limit: 200 },
  { name: "Investimentos", icon: TrendingUp, spent: 1500, limit: 2000 },
  { name: "Pet", icon: Dog, spent: 145, limit: 250 },
];

export const cards = [
  {
    id: "nubank",
    name: "Nubank Ultravioleta",
    brand: "Mastercard",
    last4: "4021",
    limit: 15000,
    used: 4820,
    dueDay: 12,
    color: "from-violet-600/40 via-fuchsia-500/20 to-transparent",
  },
  {
    id: "xp",
    name: "XP Visa Infinite",
    brand: "Visa",
    last4: "8804",
    limit: 25000,
    used: 12340,
    dueDay: 22,
    color: "from-slate-500/40 via-slate-400/20 to-transparent",
  },
  {
    id: "itau",
    name: "Itaú Personnalité",
    brand: "Visa",
    last4: "1177",
    limit: 20000,
    used: 6210,
    dueDay: 5,
    color: "from-orange-600/40 via-amber-500/20 to-transparent",
  },
];

export const accounts = [
  { name: "Itaú Pessoal", balance: 24560.4, kind: "Conta corrente" },
  { name: "Nubank", balance: 4820.15, kind: "Conta digital" },
  { name: "XP Investimentos", balance: 88450.0, kind: "Investimentos" },
  { name: "Inter", balance: 1210.25, kind: "Conta digital" },
];

export const monthly = [
  { m: "Out", income: 8900, expense: 5400 },
  { m: "Nov", income: 9200, expense: 6100 },
  { m: "Dez", income: 12800, expense: 8200 },
  { m: "Jan", income: 9600, expense: 5820 },
  { m: "Fev", income: 10400, expense: 6480 },
  { m: "Mar", income: 12400, expense: 5120 },
];

export const upcoming = [
  { title: "Netflix Premium", due: "Amanhã", amount: 55.9 },
  { title: "Aluguel", due: "25 Mar", amount: 2400 },
  { title: "Fatura Nubank", due: "12 Abr", amount: 4820 },
];

export const goals = [
  { title: "Viagem Japão", saved: 8500, target: 18000 },
  { title: "Reserva Emergência", saved: 15000, target: 20000 },
  { title: "MacBook Pro", saved: 4200, target: 14000 },
];
