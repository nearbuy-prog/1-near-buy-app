"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Local-only favorites for v1. When auth lands in Phase 2, we'll mirror this
 * state to Supabase via a sync hook — but the public API stays identical so
 * components don't need to change.
 */

interface FavoritesState {
  ids: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) =>
        set((s) => (s.ids.includes(id) ? s : { ids: [id, ...s.ids] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      toggle: (id) =>
        set((s) =>
          s.ids.includes(id)
            ? { ids: s.ids.filter((x) => x !== id) }
            : { ids: [id, ...s.ids] },
        ),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "nearby:favorites",
    },
  ),
);
