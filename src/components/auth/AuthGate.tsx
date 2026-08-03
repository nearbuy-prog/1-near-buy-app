"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { WelcomeAuth } from "@/components/auth/WelcomeAuth";
import { Logo } from "@/components/brand/Logo";

/**
 * Gates the whole app behind sign-in. Until the user has an account (or signs
 * in), we show the welcome / auth screen — which comes *before* the city
 * picker and the rest of the experience.
 *
 * We wait for the persisted store to hydrate on the client before deciding, so
 * a returning (signed-in) user doesn't see a flash of the auth screen.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <Logo size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <WelcomeAuth />;

  return <>{children}</>;
}
