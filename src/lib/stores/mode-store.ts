"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppMode } from "@/lib/types";

/**
 * Tracks whether the user is currently browsing as a customer or running the
 * seller dashboard. In production these would be separate accounts; for the
 * prototype we allow free switching.
 *
 * `activeStoreId` records which store the seller is "logged in as" so the
 * seller-side pages can pull store + products without a real auth backend.
 */
interface ModeState {
  mode: AppMode;
  activeStoreId: string;
  setMode: (mode: AppMode) => void;
  setActiveStore: (storeId: string) => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: "customer",
      // Default seller account = Dar Al Anaqa (matches the most-populated demo store).
      activeStoreId: "store-001",
      setMode: (mode) => set({ mode }),
      setActiveStore: (storeId) => set({ activeStoreId: storeId }),
    }),
    { name: "nearby:mode" },
  ),
);
