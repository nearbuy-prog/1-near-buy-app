"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppMode } from "@/lib/types";

/**
 * Prototype auth layer. There is no real backend yet (Supabase is deferred),
 * so this simply records that the user has "signed in" and which kind of
 * account they chose. The gate in <AuthGate> uses `isAuthenticated` to decide
 * whether to show the welcome / sign-in screen before the rest of the app.
 */

export type AuthMethod = "phone" | "email" | "google" | "apple";

export interface AuthUser {
  /** customer (shopper) or seller — drives which experience they land in. */
  accountType: AppMode;
  method: AuthMethod;
  /** Phone number, email, or provider handle. Display only. */
  identity: string;
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      signIn: (user) => set({ isAuthenticated: true, user }),
      signOut: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: "nearby:auth" },
  ),
);
