"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CityId } from "@/lib/types";

interface CityState {
  city: CityId;
  /** True until user has explicitly picked a city — used to prompt the city sheet on first load. */
  hasSelected: boolean;
  setCity: (city: CityId) => void;
  resetCity: () => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      city: "muscat",
      hasSelected: false,
      setCity: (city) => set({ city, hasSelected: true }),
      resetCity: () => set({ city: "muscat", hasSelected: false }),
    }),
    {
      name: "nearby:city",
    },
  ),
);
