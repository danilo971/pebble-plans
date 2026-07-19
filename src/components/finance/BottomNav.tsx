import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BarChart3, Plus, CreditCard, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { to: string; label: string; icon: LucideIcon };

const items: Item[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/transactions", label: "Extrato", icon: BarChart3 },
  { to: "/cards", label: "Cartões", icon: CreditCard },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="glass fixed bottom-4 left-4 right-4 z-50 flex h-16 items-center justify-around rounded-full border border-white/10 px-2 shadow-2xl shadow-black/40"
    >
      {items.slice(0, 2).map((i) => (
        <NavButton key={i.to} item={i} active={pathname === i.to} />
      ))}

      <Link
        to="/add"
        aria-label="Nova transação"
        className="-translate-y-2 grid size-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform active:scale-90"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </Link>

      {items.slice(2).map((i) => (
        <NavButton key={i.to} item={i} active={pathname === i.to} />
      ))}
    </nav>
  );
}

function NavButton({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`flex min-h-11 min-w-11 flex-col items-center gap-0.5 transition-colors ${
        active ? "text-accent" : "text-white/40"
      }`}
    >
      <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
      <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
    </Link>
  );
}
