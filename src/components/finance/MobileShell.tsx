import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] pb-32">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
