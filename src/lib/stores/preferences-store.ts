"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Lightweight per-device app preferences (local-only, like the rest of the
 * prototype). Kept separate from feature stores so settings can toggle them.
 */
interface PreferencesState {
  /** When off, customer-facing in-app notifications are not recorded. */
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
    }),
    { name: "nearby:prefs" },
  ),
);
