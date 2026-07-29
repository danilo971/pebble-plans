import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/use-auth";

export function MobileShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] pb-32">
        {loading || !session ? (
          <div className="grid min-h-dvh place-items-center">
            <Loader2 className="size-5 animate-spin text-white/40" />
          </div>
        ) : (
          <>
            {children}
            <BottomNav />
          </>
        )}
      </div>
    </div>
  );
}
